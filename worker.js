// Instagram Story Downloader Bot
export default {
  async fetch(request, env, ctx) {
    // Only POST requests from Telegram
    if (request.method !== "POST") {
      return new Response("OK");
    }
    
    try {
      const update = await request.json();
      const chatId = update.message?.chat?.id;
      const text = update.message?.text;
      const token = env.BOT_TOKEN;
      
      // Agar message nahi hai to return
      if (!chatId || !text) {
        return new Response("OK");
      }
      
      // Welcome message
      if (text === "/start") {
        await sendMessage(chatId, "🎬 **Instagram Story Downloader Bot**\n\nBas Instagram story ka link bhejo, main download kar dunga!", token);
        return new Response("OK");
      }
      
      // Instagram link check
      if (text.includes("instagram.com/stories/")) {
        await sendMessage(chatId, "⏳ Downloading...", token);
        
        // Download story
        const storyUrl = await downloadStory(text);
        
        if (storyUrl) {
          await sendVideo(chatId, storyUrl, token);
        } else {
          await sendMessage(chatId, "❌ Download failed. Story public hai?", token);
        }
      } else {
        await sendMessage(chatId, "❌ Bas Instagram story links kaam karte hain!", token);
      }
      
      return new Response("OK");
    } catch (error) {
      return new Response("Error");
    }
  },
};

// Story download function
async function downloadStory(url) {
  try {
    const apiUrl = `https://api.yt-dlp.org/download?url=${encodeURIComponent(url)}&format=best`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    return data.url || null;
  } catch (e) {
    return null;
  }
}

// Message send function
async function sendMessage(chatId, text, token) {
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
  await fetch(url);
}

// Video send function
async function sendVideo(chatId, videoUrl, token) {
  const url = `https://api.telegram.org/bot${token}/sendVideo?chat_id=${chatId}&video=${videoUrl}`;
  await fetch(url);
}
