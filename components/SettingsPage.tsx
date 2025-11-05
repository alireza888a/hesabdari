import React from 'react';
// FIX: Corrected import path to point to the actual Settings component. The original path was to an empty file.
import Settings from '../pages/Settings';
// FIX: The prop types were outdated. Updated `Theme` to `ThemeSettings` to match the component being used.
import { CompanyInfo, AppData, AIAssistantSettings, ThemeSettings } from '../types';

interface SettingsPageProps {
    companyInfo: CompanyInfo;
    aiSettings: AIAssistantSettings;
    // FIX: Changed `theme` to `themeSettings` to match the props of the Settings component.
    themeSettings: ThemeSettings;
    onSaveCompanyInfo: (newInfo: CompanyInfo) => void;
    onSaveAiSettings: (newSettings: AIAssistantSettings) => void;
    // FIX: Changed `onSaveTheme` to `onSaveThemeSettings` to match the props of the Settings component.
    onSaveThemeSettings: (newSettings: ThemeSettings) => void;
    onExport: () => void;
    onImport: (data: AppData) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    return (
        <div>
            {/* With the props fixed, spreading them here is now correct. */}
            <Settings {...props} />
        </div>
    );
};

export default SettingsPage;
