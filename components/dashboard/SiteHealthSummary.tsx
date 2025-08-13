
import React from 'react';
import Card from '../ui/Card';
import { Site, Asset } from '../../types';

interface SiteHealthSummaryProps {
    sites: Site[];
    onSiteSelect: (siteId: string) => void;
    getAllAssets: (siteId: string) => Asset[];
}

const SiteHealthSummary: React.FC<SiteHealthSummaryProps> = ({ sites, onSiteSelect, getAllAssets }) => (
    <Card>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Site Health Overview</h2>
        <div className="space-y-4">
            {sites.map(site => {
                const totalAssets = getAllAssets(site.id).length;
                const healthPercentage = totalAssets > 0 ? (1 - (site.sidebarStats.unhealthy / totalAssets)) * 100 : 100;

                return (
                    <div key={site.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onSiteSelect(site.id)}>
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100">{site.name}</h3>
                            <span className={`text-sm font-semibold ${healthPercentage > 95 ? 'text-green-500' : 'text-amber-500'}`}>
                                {healthPercentage.toFixed(1)}% Health
                            </span>
                        </div>
                        <div className="flex justify-around text-center mt-2 text-xs">
                            <div><span className="font-bold text-red-500">{site.namurSummary.F}</span><p>Failures</p></div>
                            <div><span className="font-bold text-purple-500">{site.namurSummary.M}</span><p>Maint.</p></div>
                            <div><span className="font-bold text-amber-500">{site.namurSummary.S}</span><p>Out of Spec</p></div>
                            <div><span className="font-bold text-blue-500">{site.namurSummary.C}</span><p>Func. Check</p></div>
                        </div>
                    </div>
                )
            })}
        </div>
    </Card>
);

export default SiteHealthSummary;
