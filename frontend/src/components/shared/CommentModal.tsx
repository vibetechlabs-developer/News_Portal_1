import { useState, useEffect } from 'react';
import { X, Send, UserCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import type { CommentItem } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    comments: CommentItem[];
    onSubmitComment: (content: string) => Promise<void>;
    isLoading?: boolean;
}

export function CommentModal({
    isOpen,
    onClose,
    comments,
    onSubmitComment,
    isLoading = false,
}: CommentModalProps) {
    const { language } = useLanguage();
    const { user } = useAuth();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const t = {
        comments: language === 'en' ? 'Comments' : 'ટિપ્પણીઓ',
        placeholder: language === 'en' ? 'Add a comment...' : 'ટિપ્પણી ઉમેરો...',
        loginToComment: language === 'en' ? 'Log in to comment' : 'ટિપ્પણી કરવા માટે લૉગ ઇન કરો',
        noComments: language === 'en' ? 'No comments yet. Be the first!' : 'હજી સુધી કોઈ ટિપ્પણી નથી. પ્રથમ બનો!',
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            await onSubmitComment(newComment.trim());
            setNewComment('');
        } catch (err) {
            console.error('Failed to post comment', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-[60]"
                onClick={onClose}
            />
            <div className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-[500px] md:bottom-auto md:top-1/2 md:-translate-y-1/2 bg-white rounded-t-2xl md:rounded-2xl shadow-2xl z-[70] flex flex-col max-h-[80vh] h-[500px] overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-white px-4 py-3 border-b flex items-center justify-between z-10">
                    <h3 className="font-bold text-lg">{t.comments} ({comments.length})</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Comment List */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {t.noComments}
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 overflow-hidden">
                                    <UserCircle2 className="w-full h-full" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-semibold text-sm">
                                            {(comment as any).guest_name || (
                                                typeof comment.user === 'object' && comment.user
                                                    ? `${comment.user.first_name || 'User'} ${comment.user.last_name || ''}`.trim()
                                                    : 'Guest'
                                            )}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm mt-1 text-gray-800 break-words">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Comment Input */}
                <div className="sticky bottom-0 bg-white border-t p-4 z-10">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={t.placeholder}
                            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmitting}
                            className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5 ml-1" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
