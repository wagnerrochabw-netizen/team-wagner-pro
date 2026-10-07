import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface CommunityPhotoAnalysis {
  categoria: 'Treino' | 'Alimentação' | 'Inválido';
  moderacao_aprovada: boolean;
  descricao_visual: string;
  comentario_motivacional: string;
  tags: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, text } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem não fornecida (formato base64 ou data URL necessário)' },
        { status: 400 }
      );
    }

    // Processa a imagem para extrair mimeType e data base64
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const systemInstruction = `Você é a inteligência artificial central de um aplicativo de comunidade fitness e vida saudável do Team Wagner, que funciona como uma rede social. Os atletas e usuários postam fotos de suas refeições (pratos, marmitas, shakes, suplementação saudável) e de seus treinos (exercícios, academia, corrida, pós-treino, evolução) para que todos na comunidade possam ver, curtir e se motivar.

Sua função é analisar cada nova foto enviada por um usuário antes ou logo após ela ir para o feed público, garantindo que o ambiente seja 100% seguro, saudável e gerando engajamento e incentivo automático.

Retorne SEMPRE um JSON válido com a seguinte estrutura:
- "categoria": "Treino", "Alimentação" ou "Inválido" (se não tiver relação com treino, saúde, esporte ou alimentação).
- "moderacao_aprovada": true se for apropriada para um ambiente público, fitness e saudável, ou false se contiver nudez explícita, violência, drogas ou conteúdo ofensivo.
- "descricao_visual": Uma breve descrição objetiva do que está na foto (ex: "Prato com frango grelhado, arroz integral e brócolis", "Atleta executando agachamento livre na academia").
- "comentario_motivacional": Um comentário curto, amigável, acolhedor e muito entusiasmado (como se fosse o treinador Wagner Rocha ou nutricionista parceiro) para ser postado automaticamente pelo Bot do App, incentivando a pessoa com emojis positivos.
- "tags": Lista de 3 a 5 hashtags relevantes com "#" no início (ex: ["#TreinoFoco", "#AlimentacaoSaudavel", "#LegDay", "#TeamWagner", "#Consistencia"]).`;

    const parts: any[] = [
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      {
        text: `Legenda/Comentário do usuário: "${text || 'Sem legenda'}". Analise a imagem e gere a resposta estruturada para o feed da comunidade.`,
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoria: {
              type: Type.STRING,
              enum: ['Treino', 'Alimentação', 'Inválido'],
              description: 'Identificação do tipo de conteúdo',
            },
            moderacao_aprovada: {
              type: Type.BOOLEAN,
              description: 'Aprovação de moderação para o feed público',
            },
            descricao_visual: {
              type: Type.STRING,
              description: 'Breve descrição do conteúdo visual da foto',
            },
            comentario_motivacional: {
              type: Type.STRING,
              description: 'Comentário entusiasmado com emojis para engajar o usuário',
            },
            tags: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: '3 a 5 hashtags com #',
            },
          },
          required: [
            'categoria',
            'moderacao_aprovada',
            'descricao_visual',
            'comentario_motivacional',
            'tags',
          ],
        },
      },
    });

    const rawText = response.text?.trim() || '{}';
    const result: CommunityPhotoAnalysis = JSON.parse(rawText);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro na análise de foto com IA:', error);
    return NextResponse.json(
      {
        categoria: 'Treino',
        moderacao_aprovada: true,
        descricao_visual: 'Foto compartilhada pelo atleta na comunidade',
        comentario_motivacional: 'Excelente dedicação! Continue firme na sua rotina e consistência! 🔥💪⚡',
        tags: ['#TeamWagner', '#Foco', '#Consistencia', '#VidaSaudavel'],
        errorDetail: error?.message,
      },
      { status: 200 }
    );
  }
}
