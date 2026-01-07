# 🤖 AI Features Setup Guide

Your MarketPilot AI app now includes powerful AI features! Here's how to set them up.

## Features Included

✅ **AI Content Generation** - Generate social media posts with AI
✅ **Post Suggestions** - Get multiple content variations
✅ **Post Optimization** - Optimize your posts for better engagement
✅ **Analytics Insights** - AI-powered analytics and recommendations

## Setup Instructions

### Option 1: Using Groq (Recommended - Faster & Free)

1. **Get a Groq API Key**:
   - Go to https://console.groq.com
   - Sign up for a free account
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key

2. **Add to Environment Variables**:
   - Open your `.env.local` file
   - Add:
     ```env
     GROQ_API_KEY=your_groq_api_key_here
     ```
   - Save the file

3. **Restart your dev server**:
   ```bash
   npm run dev
   ```

### Option 2: Using OpenAI

1. **Get an OpenAI API Key**:
   - Go to https://platform.openai.com
   - Sign up or log in
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key

2. **Add to Environment Variables**:
   - Open your `.env.local` file
   - Add:
     ```env
     OPENAI_API_KEY=your_openai_api_key_here
     ```
   - Save the file

3. **Restart your dev server**:
   ```bash
   npm run dev
   ```

### Option 3: Use Both (Groq as Primary, OpenAI as Fallback)

Add both keys to `.env.local`:
```env
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

The app will use Groq first, and fallback to OpenAI if Groq is unavailable.

## How to Use AI Features

### 1. AI Content Generation

1. Go to **Dashboard** → Click **"New Post"**
2. In the post form, click the **"AI Generate"** tab
3. Enter what you want to post about (e.g., "Announce our new product launch")
4. Select platform, tone, and length
5. Click **"Generate Content"** or **"Get Suggestions"**
6. Review the generated content
7. Click **"Use This"** to add it to your post

### 2. Post Optimization

1. Write your post content manually
2. Click the **"AI Optimize"** tab
3. Click **"Optimize Content"**
4. Review the optimized version, improvements, and tips
5. Click **"Use Optimized"** to apply

### 3. Analytics Insights

1. Go to **Dashboard**
2. Scroll to the **"AI Analytics Insights"** card
3. Click **"Generate Insights"**
4. Get AI-powered recommendations based on your data

## API Routes Created

- `/api/ai/generate-content` - Generate content and suggestions
- `/api/ai/optimize-post` - Optimize existing content
- `/api/ai/analytics-insights` - Generate analytics insights

## Models Used

- **Groq**: `llama-3.1-70b-versatile` (fast, free tier available)
- **OpenAI**: `gpt-4o-mini` (cost-effective, high quality)

## Platform-Specific Optimization

The AI automatically optimizes content for each platform:

- **Twitter**: Concise, hashtags, max 280 chars
- **LinkedIn**: Professional, value-driven, 200-300 words
- **Facebook**: Friendly, engaging, 100-200 words
- **Instagram**: Creative, emojis, hashtags, 100-200 words
- **TikTok**: Trendy, fun, hashtags, 50-100 words

## Troubleshooting

### Error: "AI service not configured"
- Make sure you've added at least one API key to `.env.local`
- Restart your dev server after adding keys
- Check that the key is correct (no extra spaces)

### Error: "Failed to generate content"
- Check your API key is valid
- Verify you have credits/quota remaining
- Check browser console for detailed error messages

### Content not generating
- Check your internet connection
- Verify API keys in `.env.local`
- Check Supabase logs for errors
- Try using the other AI provider (Groq/OpenAI)

## Cost Considerations

- **Groq**: Free tier available, very fast responses
- **OpenAI**: Pay-as-you-go, ~$0.15 per 1M tokens (gpt-4o-mini)

For development and testing, Groq's free tier is recommended.

## Next Steps

After setting up AI features:
1. ✅ Test content generation
2. ✅ Try post optimization
3. ✅ Generate analytics insights
4. 🔄 Consider implementing authentication (next feature)

---

**Need Help?** Check the browser console (F12) for detailed error messages.

