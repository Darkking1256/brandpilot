# 🔄 Content Repurposing Feature Guide

Your Content Repurposing feature is now fully functional! Here's how to use it.

## ✅ Features Implemented

- ✅ **AI-Powered Repurposing** - Uses OpenAI/Groq to adapt content for different platforms
- ✅ **Multi-Platform Support** - Repurpose for Twitter, LinkedIn, Facebook, Instagram, TikTok
- ✅ **Batch Repurposing** - Repurpose for multiple platforms at once
- ✅ **Source Platform Detection** - Specify original platform for better adaptation
- ✅ **Tone Preservation** - Option to preserve original tone or adapt to platform
- ✅ **Save as Posts** - Directly save repurposed content as scheduled posts
- ✅ **Copy to Clipboard** - Easy copying of repurposed content

## How to Use

### Step 1: Navigate to Repurpose Page
1. Go to: `http://localhost:3000/dashboard/repurpose`
2. You'll see the Content Repurposing tool

### Step 2: Input Your Content
1. **Select Source Platform** (Optional):
   - Choose where the content originally came from
   - Helps AI understand the context better
   - Options: Twitter, LinkedIn, Facebook, Instagram, TikTok, or "Original Content"

2. **Paste Your Content**:
   - Paste any content (blog post, social media post, article, etc.)
   - Can be long-form or short-form content
   - The AI will adapt it appropriately

### Step 3: Select Target Platforms
1. **Choose Platforms**:
   - Check the platforms you want to repurpose for
   - You can select multiple platforms at once
   - Options: Twitter/X, LinkedIn, Facebook, Instagram, TikTok

2. **Tone Options**:
   - ✅ **Preserve original tone** - Maintains the style of the original
   - ☐ **Adapt to platform** - Adjusts tone to match platform best practices

### Step 4: Repurpose
1. Click **"Repurpose Content"** button
2. Wait for AI to process (usually 5-15 seconds)
3. View repurposed content in the "Repurposed Content" tab

### Step 5: Use Repurposed Content
1. **Copy to Clipboard**:
   - Click "Copy" button next to any platform
   - Content is copied to your clipboard
   - Use it anywhere you need

2. **Save as Post**:
   - Click "Save as Post" button
   - Fill in scheduling details (date, time, optional images/links)
   - Content is saved as a scheduled post
   - Appears in your Scheduler page

## Example Workflow

### Example 1: Blog Post → Social Media
1. **Input**: Long blog post about "10 Marketing Tips"
2. **Source**: "Original Content"
3. **Targets**: Twitter, LinkedIn, Instagram
4. **Result**: 
   - Twitter: Concise thread-style post with hashtags
   - LinkedIn: Professional, value-focused post
   - Instagram: Creative caption with emojis and hashtags

### Example 2: Twitter Post → Other Platforms
1. **Input**: A Twitter thread about product launch
2. **Source**: "Twitter/X"
3. **Targets**: LinkedIn, Facebook
4. **Result**:
   - LinkedIn: Expanded professional version
   - Facebook: More conversational, engagement-focused version

### Example 3: Batch Repurposing
1. **Input**: Company announcement
2. **Source**: "Original Content"
3. **Targets**: All platforms (Twitter, LinkedIn, Facebook, Instagram, TikTok)
4. **Result**: Platform-specific versions ready to publish

## API Endpoint

### POST `/api/ai/repurpose-content`

**Request Body:**
```json
{
  "content": "Your original content here...",
  "targetPlatforms": ["twitter", "linkedin", "instagram"],
  "sourcePlatform": "other",
  "preserveTone": true
}
```

**Response:**
```json
{
  "repurposed": {
    "twitter": "Repurposed Twitter content...",
    "linkedin": "Repurposed LinkedIn content...",
    "instagram": "Repurposed Instagram content..."
  },
  "original": "Your original content here...",
  "sourcePlatform": "other"
}
```

## Platform-Specific Adaptations

### Twitter/X
- Max 280 characters
- Strategic hashtags
- Conversational and timely
- Thread-friendly format

### LinkedIn
- 200-300 words
- Professional tone
- Value-focused
- Thought leadership style

### Facebook
- 100-200 words
- Friendly and conversational
- Engagement-focused
- Questions and CTAs

### Instagram
- 100-200 words
- Creative and visual
- Strategic emojis
- Relevant hashtags

### TikTok
- 50-100 words
- Trendy and fun
- Popular phrases
- Engaging hashtags

## Tips for Best Results

1. **Clear Content**: Provide clear, well-structured original content
2. **Source Platform**: Always specify the source platform if known
3. **Tone Preservation**: Use "preserve tone" for brand consistency
4. **Batch Processing**: Select multiple platforms to save time
5. **Review & Edit**: Always review AI-generated content before publishing
6. **Save as Drafts**: Use "Save as Post" to schedule repurposed content

## Troubleshooting

### AI Not Responding
- **Check**: OpenAI/Groq API keys are configured
- **Check**: Network connection
- **Fix**: Verify API keys in `.env.local`

### Content Too Long/Short
- **Note**: AI adapts content to platform guidelines
- **Tip**: You can edit repurposed content before saving
- **Tip**: Use "Save as Post" to add scheduling details

### Wrong Tone
- **Try**: Toggle "Preserve original tone" option
- **Try**: Specify source platform more accurately
- **Note**: You can always edit the repurposed content

### Slow Processing
- **Note**: Batch repurposing takes longer (processes each platform)
- **Tip**: Repurpose for fewer platforms at once for faster results
- **Note**: Groq is faster than OpenAI for this use case

## Next Steps

After repurposing:
1. ✅ Review repurposed content
2. ✅ Edit if needed
3. ✅ Copy to clipboard or save as post
4. ✅ Schedule posts in Scheduler
5. ✅ Monitor performance across platforms

---

**Content Repurposing is now live!** 🎉

Transform your content for multiple platforms with AI! ✨

