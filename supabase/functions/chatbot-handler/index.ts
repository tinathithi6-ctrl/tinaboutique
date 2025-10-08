import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Utilise la nouvelle API Deno native
Deno.serve(async (req: Request) => {
  // Bloc de gestion CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // 1. Récupérer les clés API depuis les secrets du projet (plus sécurisé)
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); // Nouvelle clé

    if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing API keys or Supabase URL in environment variables.');
    }

    // Define GEMINI_API_URL after checking for the key
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // 2. Extraire les messages de la requête
    const body = await req.json().catch(() => null);
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastMessage = messages.length ? messages[messages.length - 1]?.text ?? '' : '';

    if (!lastMessage) {
      return new Response(JSON.stringify({ reply: "Je n'ai pas reçu de message." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 3. Initialiser le client Supabase avec la clé service_role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    // 4. Rechercher des produits et catégories pertinents dans la base de données
    const searchTerm = lastMessage.split(' ').slice(0, 5).join(' ');
    console.log('Search Term:', searchTerm);

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('name, description, price, stock')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(3);
    console.log('Products Data:', products);
    if (productsError) console.error('Products Error:', productsError);

    let categories = [];
    const categoryKeywords = ['catégories', 'articles', 'types', 'sections', 'gamme', 'chaussures', 'talons']; // Added 'chaussures', 'talons'
    const containsCategoryKeyword = categoryKeywords.some(keyword => lastMessage.toLowerCase().includes(keyword));

    if (containsCategoryKeyword) {
      const { data: allCategories, error: categoriesError } = await supabase
        .from('categories')
        .select('name, description'); // Fetch all categories
      categories = allCategories || [];
      console.log('All Categories Data:', categories);
      if (categoriesError) console.error('Categories Error:', categoriesError);
    } else {
      const { data: searchedCategories, error: categoriesError } = await supabase
        .from('categories')
        .select('name, description')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(3);
      categories = searchedCategories || [];
      console.log('Searched Categories Data:', categories);
      if (categoriesError) console.error('Categories Error:', categoriesError);
    }

    // 5. Construire le prompt pour Gemini
    const prompt = `Tu es un assistant clientèle amical, expert en mode et professionnel pour 'Boutique Tina la New-Yorkaise', une boutique en ligne de vêtements et accessoires chics pour femmes. Ton rôle est de guider les clients, de répondre à leurs questions sur les produits, les catégories, les services et les politiques du magasin.

Ton objectif est de fournir des réponses précises, concises et utiles, en te basant **uniquement** sur les informations fournies dans le CONTEXTE ci-dessous.

Si une question dépasse le cadre des informations fournies ou si tu ne peux pas y répondre avec certitude, réponds poliment que tu n'as pas cette information et que tu vas transmettre la demande à un agent humain qui pourra l'aider davantage. N'invente jamais d'informations.

Voici le contexte des produits et catégories qui pourraient être pertinents pour la question de l'utilisateur:
CONTEXTE:
---
Produits pertinents: ${JSON.stringify(products, null, 2)}
Catégories pertinentes: ${JSON.stringify(categories, null, 2)}
---

Voici l'historique de la conversation de l'utilisateur:
HISTORIQUE:
---
${JSON.stringify(messages, null, 2)}
---

En te basant sur tout cela, fournis une réponse utile au dernier message de l'utilisateur. Adresse-toi directement à l'utilisateur.`;

    // 6. Appeler l'API Gemini
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      throw new Error(`La requête à l'API Gemini a échoué: ${geminiResponse.statusText} - ${errorBody}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini Data:', geminiData); // Log Gemini's full response

    // More robust check for Gemini's response structure
    const botResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Je ne suis pas sûr de savoir comment répondre à cela.";

    // 7. Renvoyer la réponse
    return new Response(JSON.stringify({ reply: botResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in function:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
