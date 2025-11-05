import React, { useState } from 'react';
import { CompanyInfo, AppData, AIAssistantSettings, ThemeSettings } from '../types';
import CompanySettings from '../components/CompanySettings';
import AppearanceSettings from '../components/AppearanceSettings';
import AIAssistantSettingsComponent from '../components/AIAssistantSettings';
import BackupAndRestore from '../components/BackupAndRestore';
import HelpGuide from '../components/HelpGuide';
import { BuildingOffice2Icon, PaintBrushIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import QuestionMarkCircleIcon from '../components/icons/QuestionMarkCircleIcon';


interface SettingsPageProps {
    companyInfo: CompanyInfo;
    aiSettings: AIAssistantSettings;
    themeSettings: ThemeSettings;
    onSaveCompanyInfo: (newInfo: CompanyInfo) => void;
    onSaveAiSettings: (newSettings: AIAssistantSettings) => void;
    onSaveThemeSettings: (newSettings: ThemeSettings) => void;
    onExport: () => void;
    onImport: (data: AppData) => void;
}

type SettingsTab = 'company' | 'appearance' | 'ai' | 'backup' | 'help';

const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('company');
    
    const tabs = [
        { id: 'company', label: 'اطلاعات شرکت', icon: <BuildingOffice2Icon className="w-5 h-5" /> },
        { id: 'appearance', label: 'ظاهر برنامه', icon: <PaintBrushIcon className="w-5 h-5" /> },
        { id: 'ai', label: 'دستیار هوشمند', icon: <SparklesIcon className="w-5 h-5" /> },
        { id: 'backup', label: 'پشتیبان‌گیری', icon: <ArrowPathIcon className="w-5 h-5" /> },
        { id: 'help', label: 'راهنما', icon: <QuestionMarkCircleIcon /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'company':
                return <CompanySettings companyInfo={props.companyInfo} onSave={props.onSaveCompanyInfo} />;
            case 'appearance':
                return <AppearanceSettings themeSettings={props.themeSettings} onSave={props.onSaveThemeSettings} />;
            case 'ai':
                return <AIAssistantSettingsComponent settings={props.aiSettings} onSave={props.onSaveAiSettings} />;
            case 'backup':
                return <BackupAndRestore onExport={props.onExport} onImport={props.onImport} />;
            case 'help':
                return <HelpGuide />;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200/50 inline-flex items-center gap-2 mb-6 flex-wrap">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as SettingsTab)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default SettingsPage;
