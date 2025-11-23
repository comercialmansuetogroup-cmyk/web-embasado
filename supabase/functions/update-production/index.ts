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

const ZONE_MAPPING: Record<string, string> = {
  "COMERCIAL ZONA NORTE": "GRAN CANARIA",
  "COMERCIAL ZONA SUR": "GRAN CANARIA",
  "WEB": "GRAN CANARIA",
  "OFICINA": "GRAN CANARIA",
  "DELEGACIÓN TENERIFE NORTE": "TENERIFE",
  "DELEGACIÓN TENERIFE SUR": "PINGUINO",
  "COMERCIAL LANZAROTE": "FILIPPO",
  "DELEGACIÓN LA PALMA": "LA PALMA",
};

function normalizeZoneName(zoneName: string): string {
  const upperZoneName = zoneName.trim().toUpperCase();
  return ZONE_MAPPING[upperZoneName] || zoneName;
}

function mergeZones(existingZones: Zona[], newZones: Zona[]): Zona[] {
  const mergedZones: Zona[] = JSON.parse(JSON.stringify(existingZones));

  newZones.forEach((newZone) => {
    const normalizedName = normalizeZoneName(newZone.nombre);

    const existingZoneIndex = mergedZones.findIndex(
      (z) => z.nombre === normalizedName
    );

    if (existingZoneIndex === -1) {
      mergedZones.push({
        nombre: normalizedName,
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

    const productionData = await req.json();

    if (!productionData.zonas || !Array.isArray(productionData.zonas)) {
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
      finalZones = mergeZones(existingData.zonas as Zona[], productionData.zonas);

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
      const normalizedZones = productionData.zonas.map((zona: Zona) => ({
        nombre: normalizeZoneName(zona.nombre),
        productos: zona.productos
      }));

      const grouped: Record<string, Producto[]> = {};
      normalizedZones.forEach((zona: Zona) => {
        if (!grouped[zona.nombre]) {
          grouped[zona.nombre] = [];
        }
        grouped[zona.nombre].push(...zona.productos);
      });

      finalZones = Object.keys(grouped).map((nombre) => ({
        nombre,
        productos: grouped[nombre]
      }));

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

    productionData.zonas.forEach((zona: Zona) => {
      const normalizedZoneName = normalizeZoneName(zona.nombre);
      zona.productos.forEach((producto: Producto) => {
        historyPromises.push(
          supabase.from("production_history").insert({
            date: today,
            zone_name: normalizedZoneName,
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