import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const method = req.method;
    const body = method !== 'GET' ? await req.json() : null;

    switch (method) {
      case 'GET':
        // Get all children for the user
        const { data: children, error: fetchError } = await supabase
          .from('children')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        return new Response(
          JSON.stringify({ children }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'POST':
        // Create new child
        const { name, age, grade, reading_level, interests, language_preference } = body;

        if (!name || !age) {
          return new Response(
            JSON.stringify({ error: 'Name and age are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: newChild, error: createError } = await supabase
          .from('children')
          .insert({
            user_id: user.id,
            name,
            age,
            grade,
            reading_level,
            interests: interests || [],
            language_preference: language_preference || 'en'
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        return new Response(
          JSON.stringify({ child: newChild, message: 'Child profile created successfully' }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'PUT':
        // Update child
        const childId = url.searchParams.get('id');
        if (!childId) {
          return new Response(
            JSON.stringify({ error: 'Child ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: updatedChild, error: updateError } = await supabase
          .from('children')
          .update(body)
          .eq('id', childId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        return new Response(
          JSON.stringify({ child: updatedChild, message: 'Child profile updated successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        // Delete child
        const deleteChildId = url.searchParams.get('id');
        if (!deleteChildId) {
          return new Response(
            JSON.stringify({ error: 'Child ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: deleteError } = await supabase
          .from('children')
          .delete()
          .eq('id', deleteChildId)
          .eq('user_id', user.id);

        if (deleteError) {
          throw deleteError;
        }

        return new Response(
          JSON.stringify({ message: 'Child profile deleted successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});