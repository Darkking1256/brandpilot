-- ============================================
-- MarketPilot AI - Demo Data Seed Script
-- ============================================
-- Run this script in Supabase SQL Editor to populate demo data
-- Uses the development mock user ID: 00000000-0000-0000-0000-000000000000

-- First, clean up any existing demo data (optional - uncomment if needed)
-- DELETE FROM posts WHERE user_id = '00000000-0000-0000-0000-000000000000';
-- DELETE FROM campaigns WHERE user_id = '00000000-0000-0000-0000-000000000000';
-- DELETE FROM messages WHERE user_id = '00000000-0000-0000-0000-000000000000';
-- DELETE FROM tracking_keywords WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- ============================================
-- CAMPAIGNS
-- ============================================
INSERT INTO campaigns (id, user_id, name, description, status, start_date, end_date, budget, target_audience, goals, platforms, created_at, updated_at)
VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'Summer Product Launch',
    'Launching our new summer collection across all social platforms with influencer partnerships and paid promotions.',
    'active',
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '30 days',
    5000.00,
    'Young professionals aged 25-35 interested in lifestyle and fashion',
    '{"impressions": 100000, "engagement": 5000, "conversions": 500}',
    ARRAY['twitter', 'instagram', 'facebook'],
    NOW() - INTERVAL '7 days',
    NOW()
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'Brand Awareness Q4',
    'End of year brand awareness campaign focusing on our core values and community engagement.',
    'active',
    CURRENT_DATE - INTERVAL '14 days',
    CURRENT_DATE + INTERVAL '60 days',
    8500.00,
    'General audience interested in sustainable products',
    '{"impressions": 250000, "engagement": 12000, "followers": 2000}',
    ARRAY['linkedin', 'twitter', 'instagram'],
    NOW() - INTERVAL '14 days',
    NOW()
  ),
  (
    'c1000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'Holiday Special Offers',
    'Promoting holiday discounts and special bundles for the festive season.',
    'paused',
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '45 days',
    3000.00,
    'Existing customers and newsletter subscribers',
    '{"sales": 200, "revenue": 15000, "email_signups": 500}',
    ARRAY['facebook', 'instagram'],
    NOW() - INTERVAL '3 days',
    NOW()
  ),
  (
    'c1000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'Content Marketing Series',
    'Educational content series establishing thought leadership in our industry.',
    'completed',
    CURRENT_DATE - INTERVAL '60 days',
    CURRENT_DATE - INTERVAL '10 days',
    2500.00,
    'Industry professionals and decision makers',
    '{"views": 50000, "shares": 1500, "leads": 100}',
    ARRAY['linkedin', 'twitter'],
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '10 days'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POSTS
-- ============================================
INSERT INTO posts (id, user_id, content, platform, status, scheduled_for, published_at, media_urls, hashtags, campaign_id, likes, comments, shares, impressions, created_at, updated_at)
VALUES
  -- Published posts (past dates)
  (
    'p1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    '🚀 Exciting news! Our summer collection is finally here! Check out our latest styles designed for the modern professional. Link in bio! #SummerStyle #NewCollection #Fashion2024',
    'instagram',
    'published',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
    ARRAY['SummerStyle', 'NewCollection', 'Fashion2024'],
    'c1000000-0000-0000-0000-000000000001',
    1247,
    89,
    156,
    45000,
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'Great insights from today''s industry panel! Key takeaway: Sustainability isn''t just a trend—it''s the future of business. Proud to be part of this movement. 🌱 #Sustainability #BusinessLeadership #FutureOfWork',
    'linkedin',
    'published',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NULL,
    ARRAY['Sustainability', 'BusinessLeadership', 'FutureOfWork'],
    'c1000000-0000-0000-0000-000000000002',
    523,
    67,
    112,
    28500,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'Behind the scenes of our latest photoshoot! 📸 Our team worked incredibly hard to bring this vision to life. Stay tuned for the full reveal tomorrow!',
    'twitter',
    'published',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    ARRAY['BehindTheScenes', 'TeamWork'],
    'c1000000-0000-0000-0000-000000000001',
    892,
    134,
    267,
    52000,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'Thank you to everyone who joined our webinar yesterday! The recording is now available. Key topics covered: AI in marketing, automation best practices, and future trends. #MarketingAI #Webinar #DigitalMarketing',
    'facebook',
    'published',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NULL,
    ARRAY['MarketingAI', 'Webinar', 'DigitalMarketing'],
    'c1000000-0000-0000-0000-000000000002',
    345,
    56,
    78,
    18500,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
  ),

  -- Scheduled posts (future dates)
  (
    'p1000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    '🎁 FLASH SALE! 24 hours only - Get 30% off our entire summer collection! Use code SUMMER30 at checkout. Don''t miss out! #FlashSale #SummerDeals #LimitedTime',
    'instagram',
    'scheduled',
    NOW() + INTERVAL '1 day',
    NULL,
    ARRAY['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800'],
    ARRAY['FlashSale', 'SummerDeals', 'LimitedTime'],
    'c1000000-0000-0000-0000-000000000001',
    0,
    0,
    0,
    0,
    NOW(),
    NOW()
  ),
  (
    'p1000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'Monday motivation: "Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill. What''s driving you this week? 💪',
    'twitter',
    'scheduled',
    NOW() + INTERVAL '2 days',
    NULL,
    NULL,
    ARRAY['MondayMotivation', 'Success', 'Inspiration'],
    NULL,
    0,
    0,
    0,
    0,
    NOW(),
    NOW()
  ),
  (
    'p1000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000000',
    'We''re hiring! 🚀 Looking for a Senior Marketing Manager to join our growing team. Remote-friendly, competitive salary, and amazing benefits. Apply now - link in bio! #Hiring #MarketingJobs #RemoteWork #CareerOpportunity',
    'linkedin',
    'scheduled',
    NOW() + INTERVAL '3 days',
    NULL,
    NULL,
    ARRAY['Hiring', 'MarketingJobs', 'RemoteWork', 'CareerOpportunity'],
    NULL,
    0,
    0,
    0,
    0,
    NOW(),
    NOW()
  ),
  (
    'p1000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000000',
    'Customer spotlight ✨ Meet Sarah, who transformed her small business using our platform. Read her inspiring story on our blog! #CustomerSuccess #SmallBusiness #Inspiration',
    'facebook',
    'scheduled',
    NOW() + INTERVAL '5 days',
    NULL,
    ARRAY['https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800'],
    ARRAY['CustomerSuccess', 'SmallBusiness', 'Inspiration'],
    'c1000000-0000-0000-0000-000000000002',
    0,
    0,
    0,
    0,
    NOW(),
    NOW()
  ),

  -- Draft posts
  (
    'p1000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000000',
    'Draft: New product announcement coming soon... Need to finalize copy and add images.',
    'twitter',
    'draft',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    0,
    0,
    0,
    NOW() - INTERVAL '1 day',
    NOW()
  ),
  (
    'p1000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000000',
    'Holiday gift guide ideas - need to compile the list and create graphics',
    'instagram',
    'draft',
    NULL,
    NULL,
    NULL,
    ARRAY['HolidayGifts', 'GiftGuide'],
    'c1000000-0000-0000-0000-000000000003',
    0,
    0,
    0,
    0,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MESSAGES (Inbox)
-- ============================================
INSERT INTO messages (id, user_id, platform, sender_name, sender_handle, sender_avatar, content, message_type, is_read, is_starred, is_archived, received_at, created_at)
VALUES
  (
    'm1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'twitter',
    'Alex Johnson',
    '@alexj_design',
    'https://i.pravatar.cc/150?u=alex',
    'Love your latest post! The summer collection looks amazing. Any plans to expand internationally?',
    'comment',
    false,
    true,
    false,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'm1000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'instagram',
    'Sarah Mitchell',
    '@sarahmitchell',
    'https://i.pravatar.cc/150?u=sarah',
    'Hi! I''m interested in collaborating on a sponsored post. Could we discuss partnership opportunities?',
    'direct_message',
    false,
    false,
    false,
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '5 hours'
  ),
  (
    'm1000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'linkedin',
    'Michael Chen',
    'michael-chen-ceo',
    'https://i.pravatar.cc/150?u=michael',
    'Great insights on sustainability! Would love to connect and discuss potential synergies between our companies.',
    'direct_message',
    true,
    true,
    false,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    'm1000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'facebook',
    'Emily Davis',
    'emily.davis.official',
    'https://i.pravatar.cc/150?u=emily',
    'Just received my order and I''m absolutely thrilled! The quality exceeded my expectations. Thank you! ⭐⭐⭐⭐⭐',
    'comment',
    true,
    false,
    false,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'm1000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'twitter',
    'Tech Weekly',
    '@techweekly',
    'https://i.pravatar.cc/150?u=techweekly',
    'We''d like to feature your company in our upcoming "Startups to Watch" segment. Please DM us for details!',
    'mention',
    false,
    true,
    false,
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
  ),
  (
    'm1000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'instagram',
    'James Wilson',
    '@jameswilson_photo',
    'https://i.pravatar.cc/150?u=james',
    'Is this item still available? I''d like to purchase it for a gift.',
    'direct_message',
    true,
    false,
    true,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SOCIAL LISTENING KEYWORDS
-- ============================================
INSERT INTO tracking_keywords (id, user_id, keyword, platforms, is_active, mention_count, positive_count, negative_count, neutral_count, last_checked, created_at, updated_at)
VALUES
  (
    'k1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'MarketPilot',
    ARRAY['twitter', 'linkedin', 'instagram'],
    true,
    156,
    98,
    12,
    46,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '30 days',
    NOW()
  ),
  (
    'k1000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    '#SocialMediaMarketing',
    ARRAY['twitter', 'instagram'],
    true,
    2450,
    1820,
    180,
    450,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '45 days',
    NOW()
  ),
  (
    'k1000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'AI Marketing Tools',
    ARRAY['linkedin', 'twitter'],
    true,
    892,
    654,
    78,
    160,
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '20 days',
    NOW()
  ),
  (
    'k1000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    '@competitor_brand',
    ARRAY['twitter'],
    true,
    345,
    189,
    67,
    89,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '15 days',
    NOW()
  ),
  (
    'k1000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    '#ContentCreator',
    ARRAY['instagram', 'tiktok'],
    false,
    5670,
    4200,
    320,
    1150,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '60 days',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see this, the demo data has been inserted successfully!
-- You should now see:
--   - 4 campaigns (1 active, 1 paused, 1 completed, 1 draft-like active)
--   - 10 posts (4 published, 4 scheduled, 2 drafts)
--   - 6 messages (3 unread, 3 read)
--   - 5 tracking keywords (4 active, 1 inactive)

SELECT 
  (SELECT COUNT(*) FROM campaigns WHERE user_id = '00000000-0000-0000-0000-000000000000') as campaigns_count,
  (SELECT COUNT(*) FROM posts WHERE user_id = '00000000-0000-0000-0000-000000000000') as posts_count,
  (SELECT COUNT(*) FROM messages WHERE user_id = '00000000-0000-0000-0000-000000000000') as messages_count,
  (SELECT COUNT(*) FROM tracking_keywords WHERE user_id = '00000000-0000-0000-0000-000000000000') as keywords_count;









