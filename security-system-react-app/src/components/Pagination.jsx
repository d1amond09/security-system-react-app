import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ metaData, onPageChange }) {
    if (!metaData || metaData.TotalPages <= 1) return null;

    const { CurrentPage, TotalPages, HasPrevious, HasNext } = metaData;

    const handlePrevious = () => HasPrevious && onPageChange(CurrentPage - 1);
    const handleNext = () => HasNext && onPageChange(CurrentPage + 1);

    return (
        <div className="flex items-center justify-end gap-4 p-4 text-slate-400">
            <span>Страница {CurrentPage} из {TotalPages}</span>
            <div className="flex items-center gap-2">
                <button
                    onClick={handlePrevious}
                    disabled={!HasPrevious}
                    className="p-2 bg-slate-700 rounded-md disabled:opacity-50 hover:enabled:bg-slate-600"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    onClick={handleNext}
                    disabled={!HasNext}
                    className="p-2 bg-slate-700 rounded-md disabled:opacity-50 hover:enabled:bg-slate-600"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}