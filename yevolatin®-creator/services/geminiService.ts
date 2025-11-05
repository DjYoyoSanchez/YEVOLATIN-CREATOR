
import { GoogleGenAI, Modality } from "@google/genai";

interface PosterOptions {
  sharpening: number;
  brightness: number;
  contrast: number;
  facialFidelity: number;
  preserveSkinTone: boolean;
  expression: string;
}

const getBase64AndMimeFromDataUrl = (dataUrl: string): { base64: string; mimeType: string } => {
  const parts = dataUrl.split(',');
  const mimeTypeMatch = parts[0].match(/:(.*?);/);
  if (!mimeTypeMatch || !mimeTypeMatch[1]) {
    throw new Error('Invalid data URL: Could not determine MIME type.');
  }
  const mimeType = mimeTypeMatch[1];
  const base64 = parts[1];
  if (!base64) {
    throw new Error('Invalid data URL: Could not extract base64 data.');
  }
  return { base64, mimeType };
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const fileToMimeType = (file: File): string => {
  return file.type;
};

// Create a new GoogleGenAI instance for each request to ensure the latest API key is used.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getBackgroundStylePrompt = (style: string): string => {
      switch (style) {
        case 'Christmas':
          return "a festive 'Christmas' theme. The background should be filled with classic Christmas elements like twinkling lights, shiny baubles, elegant ribbons, and perhaps a hint of snowflakes or a cozy fireplace scene. The color palette should be rich with reds, greens, golds, and whites. The overall mood should be joyful, celebratory, and magical.";
        case 'Neon Glow':
          return "a 'Neon Glow' theme. The background should be dark, featuring vibrant, glowing neon lines, shapes, and light effects that outline a dance scene. Think futuristic nightclub, with glowing grids on the floor, neon signs (without text), and light trails that convey movement and energy. The color palette should be electric pinks, blues, cyans, and purples against a deep black or dark blue base.";
        case 'Abstract Watercolor':
          return "an 'Abstract Watercolor' theme. The background should be a beautiful, artistic blend of soft, flowing watercolor washes and splatters. The colors should be vibrant but harmonious, suggesting fluidity and grace, like a dance painting. Use a palette of blues, greens, purples, and pinks. The texture should feel organic and hand-painted, not digitally perfect.";
        case 'Vintage Film':
          return "a 'Vintage Film' theme. The background should evoke the look of an old movie poster or a still from a classic film. Use warm, desaturated colors, film grain texture, and subtle light leaks. The scene could be a classic ballroom or a speakeasy-style dance club with vintage decor. The overall mood should be nostalgic, classy, and timeless.";
        case 'Cosmic Nebula':
          return "a 'Cosmic Nebula' theme. The background should be a breathtaking view of a colorful galaxy or nebula, full of stars, cosmic dust, and swirling clouds of interstellar gas. The colors should be deep and rich, with purples, blues, magentas, and hints of gold. The presenter should look like they are dancing among the stars, creating a magical and epic atmosphere.";
        case 'Urban Graffiti':
          return "an 'Urban Graffiti' theme. The background should be a gritty, artistic brick wall covered in high-quality, stylish graffiti art. The style should be modern street art, not messy tagging. Use bold colors, dynamic shapes, and abstract patterns. The setting is an urban dance battle or street performance. The mood should be edgy, energetic, and cool.";
        case 'Gold and Black':
        default:
          return "a 'Gold and Black' theme. The background should evoke a premium and energetic dance event. Key elements to include are: a sophisticated stage, a glossy dance floor reflecting the lights, dynamic lighting effects (like spotlights and ambient glows), and large LED screens in the background displaying abstract golden patterns or motion graphics. The overall atmosphere should be luxurious, modern, and exciting, perfectly complementing a high-end dance event.";
      }
};

export const generateContent = async (
  mainImage: File,
  personName: string,
  infoText: string,
  logo1Files: File[],
  logo2Files: File[],
  options: PosterOptions,
  backgroundStyle: string,
  socialLink: string,
  setProgressText: (text: string) => void
): Promise<{ posters: Record<string, string[]> }> => {
  setProgressText('Initializing Intelligence...');
  const ai = getAiClient();

  setProgressText('Preparing your images...');
  const mainImageBase64 = await fileToBase64(mainImage);
  const mainImageMimeType = fileToMimeType(mainImage);

  const logo1Base64 = logo1Files.length > 0 ? await fileToBase64(logo1Files[0]) : null;
  const logo1MimeType = logo1Files.length > 0 ? fileToMimeType(logo1Files[0]) : null;
  const logo2Base64 = logo2Files.length > 0 ? await fileToBase64(logo2Files[0]) : null;
  const logo2MimeType = logo2Files.length > 0 ? fileToMimeType(logo2Files[0]) : null;

  const backgroundPrompt = getBackgroundStylePrompt(backgroundStyle);

  const promptText = `
      **Objective: Create two professional, visually striking event posters (9:16 and 1:1) using the provided assets.**

      **1. Core Task: Image Composition**
      - **Presenter:** Use the main image of the presenter. Remove their original background.
      - **New Background:** Create a new, dynamic background based on this theme: ${backgroundPrompt}.
      - **Integration (Crucial):** Seamlessly blend the presenter into the new background. Add **professional lighting effects** like rim lighting and soft glows that wrap around the presenter's body to make them feel truly part of the scene, creating a more realistic and cohesive look.
      - **Watermark:** Artistically and subtly integrate the name "YevoLatin" into the background design. It should be small, semi-transparent, perhaps blurred or using a blend mode, so it feels like part of the art, not a simple overlay.

      **2. Text Content (Highest Priority - Must be VERBATIM)**
      - You MUST include the following text EXACTLY as written. Do not change, summarize, or omit anything.
      ---
      ${infoText}
      ---
      ${personName ? `- Presenter: ${personName}` : ''}

      **3. Visual Enhancements**
      - **Presenter Tuning:**
        - Sharpening: ~${options.sharpening}%
        - Brightness: ${options.brightness}%
        - Contrast: ${options.contrast}%
        - Expression: '${options.expression}'
        - Facial Fidelity: ~${options.facialFidelity}%
        ${options.preserveSkinTone ? '- Preserve original skin tone.' : ''}
      - **Logos:**
        ${logo1Base64 ? '- Place the first logo in the top-left.' : ''}
        ${logo2Base64 ? '- Place the second logo in the top-right.' : ''}
      - **Typography & Layout:**
        - Use modern, energetic, and legible fonts. Create a clear hierarchy.
        - **Integrate text creatively with the visuals.** The text should feel connected to both the background and the presenter, potentially interacting with the lighting effects or appearing partially behind the presenter, but it must always remain perfectly readable. High contrast is essential.
        - The presenter's name, if provided, should be a prominent feature.
      
      ${socialLink ? `
      **4. Interactive Element: QR Code**
      - **Generate QR Code:** Create a scannable QR code that links to this URL: ${socialLink}
      - **Placement:** Place the QR code in the bottom-right corner of the poster.
      - **Styling:** The QR code must be **stylized** and **perfectly integrated** into the design.
        - **Background:** It MUST have a **transparent background**.
        - **Size:** Make it **small and unobtrusive**, but ensure it remains scannable.
        - **Color:** The color of the QR code's data points MUST **thematically match the poster's color palette**. **Crucially, DO NOT use plain black or white for the code**. It should use a color from the poster's design (e.g., a deep red, a vibrant gold, a neon blue) that has high contrast with the area it's placed over.
        - **Center Logo:** In the exact center of the QR code, integrate a stylized letter **'Y'**. The 'Y' should also match the poster's color scheme, perhaps using a contrasting color to the QR code data points.
        - **Scannability:** The final QR code must be perfectly scannable with a standard smartphone camera.` : ''}

      **${socialLink ? '5' : '4'}. Final Output Specification**
      - **Image 1:** 9:16 aspect ratio (story).
      - **Image 2:** 1:1 aspect ratio (post).
      - Generate two distinct designs.
      - No other watermarks besides the integrated 'YevoLatin' one.

      **${socialLink ? '6' : '5'}. Final Check:**
      - Is ALL text included verbatim?
      - Are there two posters (9:16 and 1:1)?
      - Is the presenter realistically lit and integrated into the background?
      - Is the 'YevoLatin' watermark subtle and artistic?
      ${socialLink ? '- Is the QR code present, correct, and scannable?' : ''}
    `;

  const parts: any[] = [{
    text: promptText
  }, {
    inlineData: {
      mimeType: mainImageMimeType,
      data: mainImageBase64,
    },
  }];

  if (logo1Base64 && logo1MimeType) {
    parts.push({
      text: "This is the first logo for the top-left corner."
    }, {
      inlineData: {
        mimeType: logo1MimeType,
        data: logo1Base64,
      },
    });
  }
  if (logo2Base64 && logo2MimeType) {
    parts.push({
      text: "This is the second logo for the top-right corner."
    }, {
      inlineData: {
        mimeType: logo2MimeType,
        data: logo2Base64,
      },
    });
  }

  setProgressText('Generating poster designs...');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: parts
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  setProgressText('Finalizing your posters...');
  const posters: Record<string, string[]> = {
    '9:16': [],
    '1:1': [],
  };

  let storyCount = 0;
  let squareCount = 0;

  if (!response.candidates || response.candidates.length === 0) {
      throw new Error('The AI did not return any candidates. Please try again.');
  }

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
      
      // We can't know the aspect ratio for sure, so we'll just distribute them.
      // The prompt asks for one of each, so we'll assume the first is story and the second is square.
      if (storyCount === 0) {
        posters['9:16'].push(imageUrl);
        storyCount++;
      } else if (squareCount === 0) {
        posters['1:1'].push(imageUrl);
        squareCount++;
      }
    }
  }

  // If we only got one image, put it in both categories as a fallback.
  if (storyCount + squareCount === 1) {
      if (storyCount > 0) {
        posters['1:1'].push(posters['9:16'][0]);
      } else {
        posters['9:16'].push(posters['1:1'][0]);
      }
  } else if (storyCount + squareCount === 0) {
      throw new Error('The AI did not generate any images. Please try again with a different image or prompt.');
  }

  return { posters };
};

export const editTextOnPoster = async (
  originalPosterDataUrl: string,
  newText: string
): Promise<{ poster: string }> => {
  const ai = getAiClient();

  const { base64: originalPosterBase64, mimeType: originalPosterMimeType } = getBase64AndMimeFromDataUrl(originalPosterDataUrl);

  const prompt = `
    **Objective: Perform a surgical text replacement on the provided poster image.**

    **1. Core Task: Replicate and Replace**
    - **Analyze Style (Crucial):** Identify the exact typographic properties of the existing text. This includes font family, color (e.g., if it's white, keep it white; if it's gold, keep it gold), size, weight, letter spacing, line height, and any applied effects like glows, shadows, outlines, or gradients.
    - **Replace Text Content:** Remove only the old text.
    - **Insert New Text:** Apply the new text below, ensuring it **perfectly and exactly replicates the original typographic style you analyzed.** Your job is to make it look like the original designer simply typed different words.
    ---
    ${newText}
    ---

    **2. Strict Constraints (Non-negotiable):**
    - **DO NOT** be creative. This is a technical replacement task, not a design task.
    - **DO NOT** change the background, presenter's image, logos, or any other visual element.
    - **ONLY** the text content should change. The style, color, and position must be preserved.

    **3. Final Output:**
    - Return a single image of the poster with only the text updated. The aspect ratio must be identical to the original.
  `;

  const parts: any[] = [{
    text: prompt
  }, {
    inlineData: {
      mimeType: originalPosterMimeType,
      data: originalPosterBase64,
    },
  }];
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: parts
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('The AI did not return a response for the edit request.');
  }

  const part = response.candidates[0].content.parts[0];
  if (part && part.inlineData) {
    const base64ImageBytes: string = part.inlineData.data;
    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
    return { poster: imageUrl };
  } else {
    throw new Error('The AI failed to edit the poster. Please try again.');
  }
};
