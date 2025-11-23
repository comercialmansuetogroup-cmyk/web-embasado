import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Producto {
  codigo: string;
  nombre_producto: string;
  cantidad: number;
}

interface Zona {
  nombre: string;
  productos: Producto[];
}

interface ProductoAgregado {
  nombre: string;
  cantidad: number;
}

interface ParsedProduct {
  tipo: string;
  factor: number;
  gramaje: string;
}

/**
 * Parse product name to extract type, factor, and weight
 * Examples:
 * - "Burrata 3x100g" -> { tipo: "Burrata", factor: 3, gramaje: "100g" }
 * - "Mozzarella 8x125g" -> { tipo: "Mozzarella", factor: 8, gramaje: "125g" }
 * - "Ricotta 250g" -> { tipo: "Ricotta", factor: 1, gramaje: "250g" }
 */
function parseProductName(nombreProducto: string): ParsedProduct | null {
  try {
    const normalized = nombreProducto.trim();
    
    // Match pattern: "ProductName NxWg" or "ProductName Wg"
    // Examples: "Burrata 3x100g", "Mozzarella 125g"
    const withFactorMatch = normalized.match(/^([A-Za-zÀ-ÿ\s]+?)\s+(\d+)x(\d+)\s*g?$/i);
    if (withFactorMatch) {
      return {
        tipo: withFactorMatch[1].trim(),
        factor: parseInt(withFactorMatch[2]),
        gramaje: `${withFactorMatch[3]}g`,
      };
    }

    // Match pattern without factor: "ProductName Wg"
    const withoutFactorMatch = normalized.match(/^([A-Za-zÀ-ÿ\s]+?)\s+(\d+)\s*g?$/i);
    if (withoutFactorMatch) {
      return {
        tipo: withoutFactorMatch[1].trim(),
        factor: 1,
        gramaje: `${withoutFactorMatch[2]}g`,
      };
    }

    // If no pattern matches, return null
    return null;
  } catch (error) {
    console.error(`Error parsing product name: ${nombreProducto}`, error);
    return null;
  }
}

/**
 * Aggregate products by type + weight
 * Multiplies by packaging factor automatically
 */
function aggregateProducts(zonas: Zona[]): ProductoAgregado[] {
  const aggregated: Record<string, number> = {};

  zonas.forEach((zona) => {
    zona.productos.forEach((producto) => {
      const parsed = parseProductName(producto.nombre_producto);
      
      if (!parsed) {
        console.warn(`Could not parse product: ${producto.nombre_producto}`);
        return;
      }

      const key = `${parsed.tipo} ${parsed.gramaje}`;
      const totalUnits = producto.cantidad * parsed.factor;

      if (aggregated[key]) {
        aggregated[key] += totalUnits;
      } else {
        aggregated[key] = totalUnits;
      }
    });
  });

  return Object.entries(aggregated)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
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

    const requestData = await req.json();

    if (!requestData.zonas || !Array.isArray(requestData.zonas)) {
      return new Response(
        JSON.stringify({ error: "Invalid data format. Expected 'zonas' array." }),
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
    const isFirstSync = currentHour <= 5; // First sync at 04:30

    // Aggregate products by type + weight
    const productosAgregados = aggregateProducts(requestData.zonas);

    if (productosAgregados.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid products to process" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if data exists for today
    const { data: existingData, error: fetchError } = await supabase
      .from("aggregated_production_data")
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

    let result: any;

    if (!existingData || isFirstSync) {
      // First sync: Insert all data
      const { data: insertedData, error: insertError } = await supabase
        .from("aggregated_production_data")
        .upsert({
          fecha: today,
          productos: productosAgregados,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'fecha' })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting data:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to insert data", details: insertError.message }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      result = insertedData;
    } else {
      // Second sync: Merge with existing data
      const existingProductos = existingData.productos as ProductoAgregado[];
      const mergedProductos: Record<string, number> = {};

      // Start with existing data
      existingProductos.forEach((p) => {
        mergedProductos[p.nombre] = p.cantidad;
      });

      // Update with new data (only if quantity changed)
      productosAgregados.forEach((p) => {
        mergedProductos[p.nombre] = p.cantidad;
      });

      const finalProductos = Object.entries(mergedProductos)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      const { data: updatedData, error: updateError } = await supabase
        .from("aggregated_production_data")
        .update({
          productos: finalProductos,
          updated_at: new Date().toISOString(),
        })
        .eq("fecha", today)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating data:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update data", details: updateError.message }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      result = updatedData;
    }

    // Insert into history
    const historyPromises = productosAgregados.map((producto) =>
      supabase.from("aggregated_production_history").insert({
        date: today,
        product_name: producto.nombre,
        quantity: producto.cantidad,
        hour: currentHour,
      })
    );

    await Promise.all(historyPromises);

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: existingData && !isFirstSync 
          ? "Production data merged successfully" 
          : "Production data created successfully",
        processed: {
          total_products: productosAgregados.length,
          sync_type: isFirstSync ? "first_sync" : "update_sync",
        },
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