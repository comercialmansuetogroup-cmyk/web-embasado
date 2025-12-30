import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Producto {
  codigo: string;
  cantidad: number;
}

interface Zona {
  nombre: string;
  productos: Producto[];
}

interface IncomingProducto {
  codigo: string;
  cantidad: number;
}

interface IncomingZona {
  nombre: string;
  codigo_agente: string;
  nombre_agente: string;
  productos: IncomingProducto[];
}

const AGENT_CODE_TO_ZONE: Record<string, string> = {
  "5": "GRAN CANARIA",
  "10": "GRAN CANARIA",
  "14": "GRAN CANARIA",
  "15": "TENERIFE NORTE",
  "23": "INSÓLITO",
  "24": "FILIPPO",
  "26": "PINGÜINO",
};

function mapAgentCodeToZone(agentCode: string): string {
  return AGENT_CODE_TO_ZONE[agentCode] || `AGENTE_${agentCode}`;
}

function transformIncomingData(incomingZonas: IncomingZona[]): Zona[] {
  const grouped: Record<string, Record<string, number>> = {};

  incomingZonas.forEach((incomingZona) => {
    const zoneName = mapAgentCodeToZone(incomingZona.codigo_agente);
    const productCode = incomingZona.nombre;

    if (!grouped[zoneName]) {
      grouped[zoneName] = {};
    }

    incomingZona.productos.forEach((producto) => {
      if (!grouped[zoneName][productCode]) {
        grouped[zoneName][productCode] = 0;
      }
      grouped[zoneName][productCode] += producto.cantidad;
    });
  });

  return Object.keys(grouped).map((zoneName) => ({
    nombre: zoneName,
    productos: Object.keys(grouped[zoneName]).map((codigo) => ({
      codigo,
      cantidad: grouped[zoneName][codigo]
    }))
  }));
}

function mergeZones(existingZones: Zona[], newZones: Zona[]): Zona[] {
  const mergedZones: Zona[] = JSON.parse(JSON.stringify(existingZones));

  newZones.forEach((newZone) => {
    const existingZoneIndex = mergedZones.findIndex(
      (z) => z.nombre === newZone.nombre
    );

    if (existingZoneIndex === -1) {
      mergedZones.push({
        nombre: newZone.nombre,
        productos: newZone.productos
      });
    } else {
      newZone.productos.forEach((newProduct) => {
        const existingProductIndex = mergedZones[existingZoneIndex].productos.findIndex(
          (p) => p.codigo === newProduct.codigo
        );

        if (existingProductIndex === -1) {
          mergedZones[existingZoneIndex].productos.push(newProduct);
        } else {
          mergedZones[existingZoneIndex].productos[existingProductIndex].cantidad = newProduct.cantidad;
        }
      });
    }
  });

  return mergedZones;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const incomingData = await req.json();

    if (!incomingData.zonas || !Array.isArray(incomingData.zonas)) {
      return new Response(
        JSON.stringify({ error: "Invalid data format. Expected 'zonas' array with production data." }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const transformedZones = transformIncomingData(incomingData.zonas);

    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    const { data: existingData, error: fetchError } = await supabase
      .from("production_data")
      .select("*")
      .eq("fecha", today)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching existing data:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch existing data", details: fetchError.message }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let finalZones: Zona[];
    let upsertData: any;

    if (existingData) {
      finalZones = mergeZones(existingData.zonas as Zona[], transformedZones);

      const { data: updatedData, error: updateError } = await supabase
        .from("production_data")
        .update({
          zonas: finalZones,
          updated_at: new Date().toISOString(),
        })
        .eq("fecha", today)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating data:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update production data", details: updateError.message }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      upsertData = updatedData;
    } else {
      finalZones = transformedZones;

      const { data: insertedData, error: insertError } = await supabase
        .from("production_data")
        .insert({
          fecha: today,
          zonas: finalZones,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting data:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to insert production data", details: insertError.message }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      upsertData = insertedData;
    }

    const historyPromises: Promise<any>[] = [];

    transformedZones.forEach((zona: Zona) => {
      zona.productos.forEach((producto: Producto) => {
        historyPromises.push(
          supabase.from("production_history").insert({
            date: today,
            zone_name: zona.nombre,
            product_code: producto.codigo,
            quantity: producto.cantidad,
            hour: currentHour,
          })
        );
      });
    });

    await Promise.all(historyPromises);

    return new Response(
      JSON.stringify({
        success: true,
        data: upsertData,
        message: existingData ? "Production data merged successfully" : "Production data created successfully"
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});