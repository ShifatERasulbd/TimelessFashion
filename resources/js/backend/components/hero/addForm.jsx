import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function AddForm({
    form = {},
    onChange,
    onFileChange,
    onSubmit,
    onCancel,
    hero = null,
    previews = {},
    isSubmitting = false,
    errors = {},
    submitLabel = 'Create Hero',
    submittingLabel = 'Saving...',
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hero Details</CardTitle>
                <CardDescription>Fill in the hero section details for the website.</CardDescription>
            </CardHeader>
            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="hero-title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="hero-title"
                            name="title"
                            value={form.title || ''}
                            onChange={onChange}
                            placeholder="e.g. Welcome to our store"
                        />
                        {errors.title && (
                            <p className="text-xs text-destructive">{errors.title[0]}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="hero-description">
                            Description <span className="text-destructive">*</span>
                        </Label>
                        <textarea
                            id="hero-description"
                            name="description"
                            value={form.description || ''}
                            onChange={onChange}
                            placeholder="e.g. Discover our latest collection..."
                            rows={4}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">{errors.description[0]}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {/* Image */}
                        <div className="space-y-2">
                            <Label htmlFor="hero-image">
                                Image{' '}
                                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                            </Label>
                            <Input
                                id="hero-image"
                                name="image"
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={onFileChange}
                            />
                            {previews?.image && (
                                <div className="mt-3">
                                    <img
                                        src={previews.image}
                                        alt="Image preview"
                                        className="h-64 w-full object-contain rounded border bg-muted"
                                    />
                                </div>
                            )}
                            {hero?.image_url && !previews?.image && (
                                <a
                                    href={hero.image_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-600 underline"
                                >
                                    View current image
                                </a>
                            )}
                            {errors.image && (
                                <p className="text-xs text-destructive">{errors.image[0]}</p>
                            )}
                        </div>

                        {/* Video */}
                        <div className="space-y-2">
                            <Label htmlFor="hero-video">
                                Video{' '}
                                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                            </Label>
                            <Input
                                id="hero-video"
                                name="video"
                                type="file"
                                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                                onChange={onFileChange}
                            />
                            {previews?.video && (
                                <div className="mt-3">
                                    <video
                                        src={previews.video}
                                        className="h-64 w-full object-contain rounded border bg-muted"
                                        controls
                                    />
                                </div>
                            )}
                            {hero?.video_url && !previews?.video && (
                                <a
                                    href={hero.video_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-600 underline"
                                >
                                    View current video
                                </a>
                            )}
                            {errors.video && (
                                <p className="text-xs text-destructive">{errors.video[0]}</p>
                            )}
                        </div>
                    </div>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-end gap-3 pt-6">
                    <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? submittingLabel : submitLabel}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
