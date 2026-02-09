import { useState, useEffect } from 'react';
import api from '../api';
import PublicCard from '../components/PublicCard';
import BannerSection from '../components/BannerSection';

const Home = () => {
    const [contentItems, setContentItems] = useState([]);
    const [settings, setSettings] = useState({ card_radius: '16', card_scroll_speed: '0.8' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            console.log("APP VERSION: 1.3 (Relative Paths)");
            try {
                const [cardsRes, bannersRes, settingsRes] = await Promise.all([
                    api.get('/cards'),
                    api.get('/banners'),
                    api.get('/settings')
                ]);

                const cards = Array.isArray(cardsRes.data) ? cardsRes.data : [];
                const banners = Array.isArray(bannersRes.data) ? bannersRes.data : [];

                // --- Merge Logic ---
                const finalItems = [];

                // 1. Top Banners
                const topBanners = banners.filter(b => b.placement === 'top' && b.is_active);
                topBanners.forEach(b => finalItems.push({ type: 'banner', data: b }));

                // 2. Relative Banners (indexed by card ID)
                const relativeBanners = banners.filter(b => b.placement === 'relative' && b.is_active);

                // 3. Process Cards and Relative Banners
                cards.forEach(card => {
                    // Check for 'before' banners
                    const before = relativeBanners.filter(b => b.target_card_id === card.id && b.relative_position === 'before');
                    before.forEach(b => finalItems.push({ type: 'banner', data: b }));

                    // Add Card
                    finalItems.push({ type: 'card', data: card });

                    // Check for 'after' banners
                    const after = relativeBanners.filter(b => b.target_card_id === card.id && b.relative_position === 'after');
                    after.forEach(b => finalItems.push({ type: 'banner', data: b }));
                });

                // 4. Bottom Banners
                const bottomBanners = banners.filter(b => b.placement === 'bottom' && b.is_active);
                bottomBanners.forEach(b => finalItems.push({ type: 'banner', data: b }));

                setContentItems(finalItems);

                if (settingsRes.data) {
                    setSettings({
                        card_radius: settingsRes.data.card_radius || '16',
                        card_scroll_speed: settingsRes.data.card_scroll_speed || '0.8'
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-white/50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
        );
    }

    // Track card index separately to maintain alternating layout consistency
    let cardIndexCounter = 0;

    return (
        <div className="space-y-12">
            <div className="flex flex-col gap-12">
                {contentItems.map((item, index) => {
                    if (item.type === 'banner') {
                        return <BannerSection key={`banner-${item.data.id}-${index}`} banner={item.data} />;
                    } else {
                        // Card
                        const currentCardIndex = cardIndexCounter++;
                        return (
                            <PublicCard
                                key={`card-${item.data.id}`}
                                card={item.data}
                                index={currentCardIndex}
                                borderRadius={parseInt(settings.card_radius) || 16}
                                scrollSpeed={parseFloat(settings.card_scroll_speed) || 0.8}
                            />
                        );
                    }
                })}
            </div>

            {contentItems.length === 0 && (
                <div className="text-center text-gray-400 py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-xl">No content available at the moment.</p>
                </div>
            )}
        </div>
    );
};

export default Home;
