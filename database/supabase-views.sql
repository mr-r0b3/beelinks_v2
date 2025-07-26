-- ====================================================================
-- 📊 BeeLinks - Views e Estatísticas
-- ====================================================================
-- Execute este arquivo APÓS executar os dois arquivos anteriores
-- ====================================================================

-- ====================================================================
-- 📈 VIEW: user_stats (Estatísticas de usuário)
-- ====================================================================

CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(DISTINCT l.id) as total_links,
    COUNT(DISTINCT la.id) FILTER (WHERE la.event_type = 'click') as total_clicks,
    COUNT(DISTINCT la.id) FILTER (WHERE la.event_type = 'view') as total_views,
    COUNT(DISTINCT pa.id) as profile_views,
    DATE_TRUNC('month', la.created_at) as month
FROM users u
LEFT JOIN links l ON u.id = l.user_id AND l.is_active = true
LEFT JOIN link_analytics la ON l.id = la.link_id
LEFT JOIN profile_analytics pa ON u.id = pa.user_id
GROUP BY u.id, u.username, DATE_TRUNC('month', la.created_at);

-- ====================================================================
-- 🔥 VIEW: popular_links (Links populares)
-- ====================================================================

CREATE OR REPLACE VIEW popular_links AS
SELECT 
    l.*,
    u.username,
    COUNT(la.id) FILTER (WHERE la.event_type = 'click') as click_count,
    COUNT(la.id) FILTER (WHERE la.event_type = 'view') as view_count
FROM links l
JOIN users u ON l.user_id = u.id
LEFT JOIN link_analytics la ON l.id = la.link_id
WHERE l.is_active = true
GROUP BY l.id, u.username
ORDER BY click_count DESC, view_count DESC;

-- ====================================================================
-- 📊 VIEW: daily_analytics (Analytics diárias)
-- ====================================================================

CREATE OR REPLACE VIEW daily_analytics AS
SELECT 
    DATE(la.created_at) as date,
    l.user_id,
    l.id as link_id,
    l.title as link_title,
    COUNT(*) FILTER (WHERE la.event_type = 'click') as daily_clicks,
    COUNT(*) FILTER (WHERE la.event_type = 'view') as daily_views,
    COUNT(DISTINCT la.visitor_ip) as unique_visitors
FROM link_analytics la
JOIN links l ON la.link_id = l.id
GROUP BY DATE(la.created_at), l.user_id, l.id, l.title
ORDER BY date DESC;

-- ====================================================================
-- 🌍 VIEW: geographic_analytics (Analytics geográficas)
-- ====================================================================

CREATE OR REPLACE VIEW geographic_analytics AS
SELECT 
    la.visitor_country,
    la.visitor_city,
    l.user_id,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE la.event_type = 'click') as clicks,
    COUNT(*) FILTER (WHERE la.event_type = 'view') as views,
    COUNT(DISTINCT la.visitor_ip) as unique_visitors
FROM link_analytics la
JOIN links l ON la.link_id = l.id
WHERE la.visitor_country IS NOT NULL
GROUP BY la.visitor_country, la.visitor_city, l.user_id
ORDER BY total_events DESC;

-- ====================================================================
-- 📱 VIEW: device_analytics (Analytics de dispositivos)
-- ====================================================================

CREATE OR REPLACE VIEW device_analytics AS
SELECT 
    la.device_type,
    la.browser,
    la.os,
    l.user_id,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE la.event_type = 'click') as clicks,
    COUNT(*) FILTER (WHERE la.event_type = 'view') as views
FROM link_analytics la
JOIN links l ON la.link_id = l.id
WHERE la.device_type IS NOT NULL
GROUP BY la.device_type, la.browser, la.os, l.user_id
ORDER BY total_events DESC;

-- ====================================================================
-- ✅ VIEWS CRIADAS
-- ====================================================================
-- Agora você tem views prontas para gerar relatórios e analytics!
-- ====================================================================
