
import { XCircle, Info, CheckCircle, Wrench, HelpCircle } from 'lucide-react';

export const getNamurInfo = (status: 'F' | 'C' | 'S' | 'M' | 'OK' | string) => {
    switch (status) {
        case 'F': return { text: 'Failure', color: '#EF4444', icon: XCircle, textColor: 'text-red-500', bgColor: 'bg-red-500' };
        case 'C': return { text: 'Function Check', color: '#F97316', icon: Wrench, textColor: 'text-orange-500', bgColor: 'bg-orange-500' };
        case 'S': return { text: 'Out of Specification', color: '#EAB308', icon: HelpCircle, textColor: 'text-yellow-500', bgColor: 'bg-yellow-500' };
        case 'M': return { text: 'Maintenance Required', color: '#3B82F6', icon: Info, textColor: 'text-blue-500', bgColor: 'bg-blue-500' };
        default: return { text: 'Normal', color: '#22C55E', icon: CheckCircle, textColor: 'text-green-500', bgColor: 'bg-green-500' };
    }
};

export const formatDuration = (start?: string): string => {
    if (!start) return 'N/A';
    const startDate = new Date(start);
    const now = new Date();
    let seconds = Math.floor((now.getTime() - startDate.getTime()) / 1000);
    const days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    const hrs = Math.floor(seconds / 3600);
    seconds -= hrs * 3600;
    const mnts = Math.floor(seconds / 60);
    
    let durationString = '';
    if (days > 0) durationString += `${days}d `;
    if (hrs > 0) durationString += `${hrs}h `;
    if (mnts > 0) durationString += `${mnts}m`;

    return durationString.trim() || 'Just now';
};
