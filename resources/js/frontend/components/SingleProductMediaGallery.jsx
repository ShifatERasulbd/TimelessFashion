export default function SingleProductMediaGallery({ images, selectedImage, onSelectImage }) {
    return (
        <div className="grid grid-cols-[72px_1fr] gap-3 lg:gap-4">
            <div className="space-y-2.5">
                {images.map((image) => (
                    <button
                        key={image}
                        type="button"
                        onClick={() => onSelectImage(image)}
                        className={`block overflow-hidden border bg-zinc-100 transition-colors ${
                            selectedImage === image
                                ? 'border-zinc-950'
                                : 'border-zinc-200 hover:border-zinc-500'
                        }`}
                        aria-label="Select product image"
                    >
                        <img
                            src={image}
                            alt="Product thumbnail"
                            className="h-[86px] w-full object-cover object-center"
                        />
                    </button>
                ))}
            </div>

            <div className="overflow-hidden border border-zinc-200 bg-zinc-100">
                <img
                    src={selectedImage}
                    alt="Corporate full sleeve t-shirt"
                    className="h-[540px] w-full object-cover object-center"
                />
            </div>
        </div>
    );
}
