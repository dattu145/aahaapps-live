import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// AutoCarousel Component implementing slide-to-center logic
const AutoCarousel = ({ items, speed, itemWidth, children }) => {
    const gap = 16;
    const effectiveItemWidth = itemWidth + gap;

    const [activeIndex, setActiveIndex] = useState(Math.floor(items.length / 2));

    const [isTransitioning, setIsTransitioning] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const maxIndex = items.length;

    // We need to calculate pause Duration based on speed (1-50)
    // Speed 50 = Fast (Short pause). Speed 1 = Slow (Long pause).
    const pauseDuration = Math.max(800, 5000 - (speed * 80));

    useEffect(() => {
        let timer;
        if (!isHovered) {
            timer = setTimeout(() => {
                handleNext();
            }, pauseDuration);
        }
        return () => clearTimeout(timer);
    }, [activeIndex, isHovered, pauseDuration]);

    const handleNext = () => {
        setIsTransitioning(true);
        setActiveIndex(prev => {
            const next = prev + 1;
            // Loop logic comes in effect via TransitionEnd or checking index
            return next;
        });
    };

    // Handle Infinite Loop Reset
    useEffect(() => {
        if (activeIndex >= items.length - (items.length / 4)) {
            const halfLength = items.length / 2;
            if (activeIndex >= halfLength * 1.5) {
                // reset
                setTimeout(() => {
                    setIsTransitioning(false);
                    setActiveIndex(prev => prev - halfLength);
                }, 700); // Wait for transition css duration
            }
        }
    }, [activeIndex, items.length]);

    // Calculate Transform
    const transformStyle = {
        transform: `translate3d(calc(50vw - ${effectiveItemWidth / 2}px - ${activeIndex * effectiveItemWidth}px), 0, 0)`,
        transition: isTransitioning ? 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
    };

    return (
        <div
            className="w-full overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex w-max" style={transformStyle}>
                {children}
            </div>
        </div>
    );
};


// Lightbox Modal Component
const Lightbox = ({ items, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handlePrev = useCallback((e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
    }, [items.length]);

    const handleNext = useCallback((e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev >= items.length - 1 ? 0 : prev + 1));
    }, [items.length]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') handlePrev(e);
        if (e.key === 'ArrowRight') handleNext(e);
    }, [handlePrev, handleNext, onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const item = items[currentIndex];

    // Default fallback if item not found
    if (!item) return null;

    const isYoutube = item.type === 'youtube';
    const isVideo = item.type === 'video';

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition z-50"
            >
                <X size={32} />
            </button>

            {/* Navigation Buttons */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 z-50 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition hidden md:block"
                    >
                        <ChevronLeft size={40} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 z-50 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition hidden md:block"
                    >
                        <ChevronRight size={40} />
                    </button>
                </>
            )}

            {/* Content Container */}
            <div
                className="w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center relative"
                onClick={(e) => e.stopPropagation()}
            >
                {isYoutube ? (
                    <div className="w-full h-full aspect-video">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${getYoutubeId(item.url)}?autoplay=1&controls=1&rel=0`}
                            frameBorder="0"
                            allow="autoplay; encrypted-media; fullscreen"
                            allowFullScreen
                            className="rounded-lg shadow-2xl"
                        />
                    </div>
                ) : isVideo ? (
                    <video
                        src={`/${item.url}`}
                        className="max-w-full max-h-full rounded-lg shadow-2xl"
                        controls
                        autoPlay
                        playsInline
                    />
                ) : (
                    <img
                        src={`/${item.url}`}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        alt="Full screen view"
                    />
                )}
            </div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm font-bold z-50">
                {currentIndex + 1} / {items.length}
            </div>
        </div>
    );
};

// Single Item in the Marquee
const BannerItem = ({ item, onClick, height, width }) => {
    const isYoutube = item.type === 'youtube';
    const isVideo = item.type === 'video';

    // Scale width based on height to maintain 3:2 aspect ratio? 
    // Or just fixed aspect ratio? 
    // Original was w-[300px] h-[200px] (3:2)
    // Let's use h={height} and w={height * 1.5}
    const hVal = height || 200;
    const wVal = width || Math.round(hVal * 1.5);

    // Prevent drag event from triggering click
    // We can do this by checking if mouse moved significantly
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const handlePointerDown = (e) => {
        setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = (e) => {
        const dist = Math.sqrt(Math.pow(e.clientX - startPos.x, 2) + Math.pow(e.clientY - startPos.y, 2));
        if (dist < 5) {
            onClick();
        }
    };

    return (
        <div
            style={{ width: `${wVal}px`, height: `${hVal}px` }}
            className="flex-shrink-0 mx-2 bg-black rounded-xl overflow-hidden relative group shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02] border border-transparent hover:border-white/20"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        >
            {isYoutube ? (
                <>
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${getYoutubeId(item.url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYoutubeId(item.url)}&showinfo=0&disablekb=1&modestbranding=1`}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        className="w-full h-full pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-transparent" />
                </>
            ) : isVideo ? (
                <video
                    src={`/${item.url}`}
                    className="w-full h-full object-cover pointer-events-none"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            ) : (
                <img src={`/${item.url}`} className="w-full h-full object-cover pointer-events-none" loading="lazy" />
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Click to Expand</span>
            </div>
        </div>
    );
};

const BannerSection = ({ banner }) => {
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            const screenWidth = window.innerWidth;
            const bannerConfigHeight = banner.height || 400; // Configured height (e.g., 600)

            let finalHeight = bannerConfigHeight;
            let finalWidth = Math.round(bannerConfigHeight * 1.5);

            // Responsive Logic
            // If the calculated width is greater than the screen width (minus padding/margins)
            // we need to scale down.
            // Let's cap the width at 90vw on mobile to ensure it fits and is centered nicely.

            if (screenWidth < 768) {
                // Mobile: Fit width to screen
                const maxMobileWidth = screenWidth - 32; // 16px padding on each side effective

                // If standard width is too big, scale down
                if (finalWidth > maxMobileWidth) {
                    finalWidth = maxMobileWidth;
                    finalHeight = Math.round(finalWidth / 1.5); // Maintain aspect ratio
                }
            } else {
                // Desktop: Check if width exceeds screen? (Unlikely for normal banners but possible)
                if (finalWidth > screenWidth) {
                    // Optionally scale down, but usually user wants specific size on desktop.
                    // But let's be safe.
                    // finalWidth = screenWidth * 0.9;
                    // finalHeight = finalWidth / 1.5;
                }
            }

            setDimensions({ width: finalWidth, height: finalHeight });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [banner.height]);

    if (!banner.is_active || !banner.media_items || banner.media_items.length === 0) return null;
    if (dimensions.width === 0) return null; // Avoid render until measured

    const originalItems = banner.media_items;

    const minItems = 20;
    let blockItems = [...originalItems];
    while (blockItems.length < minItems) {
        blockItems = [...blockItems, ...originalItems];
    }

    const displayItems = [...blockItems, ...blockItems].map((item, i) => {
        const originalIndex = i % originalItems.length;
        return {
            ...item,
            uniqueId: `${item.id}-${i}`,
            originalIndexInside: originalIndex
        };
    });

    return (
        <>
            <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden py-4">
                <AutoCarousel items={displayItems} speed={banner.speed} itemWidth={dimensions.width}>
                    {displayItems.map((item) => (
                        <BannerItem
                            key={item.uniqueId}
                            item={item}
                            height={dimensions.height}
                            width={dimensions.width}
                            onClick={() => setLightboxIndex(item.originalIndexInside)}
                        />
                    ))}
                </AutoCarousel>
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <Lightbox
                    items={originalItems}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </>
    );
}

export default BannerSection;
