import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Settings as SettingsIcon, Key, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Settings {
  defaultCategory: string;
  defaultAllowWear: boolean;
  autoSave: boolean;
  notifications: boolean;
}

const categories = [
  { value: "apparel_top", label: "Apparel Top" },
  { value: "apparel_bottom", label: "Apparel Bottom" },
  { value: "saree", label: "Saree" },
  { value: "kurti", label: "Kurti" },
  { value: "dress", label: "Dress" },
  { value: "shoes", label: "Shoes" },
  { value: "handbag", label: "Handbag" },
  { value: "electronics", label: "Electronics" },
  { value: "home_kitchen", label: "Home & Kitchen" },
  { value: "other", label: "Other" },
];

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    defaultCategory: "apparel_top",
    defaultAllowWear: true,
    autoSave: true,
    notifications: true,
  });
  const [hasGeminiKey] = useState(false); // Mock environment check
  const { toast } = useToast();

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // Mock save operation
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const resetSettings = () => {
    setSettings({
      defaultCategory: "apparel_top",
      defaultAllowWear: true,
      autoSave: true,
      notifications: true,
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to defaults.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your preferences and system settings
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Default Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Default Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Category */}
              <div className="space-y-2">
                <Label htmlFor="defaultCategory" className="text-sm font-medium">
                  Default Product Category
                </Label>
                <Select 
                  value={settings.defaultCategory} 
                  onValueChange={(value) => updateSetting('defaultCategory', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This category will be pre-selected when adding new products
                </p>
              </div>

              {/* Default Allow Wear */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Enable On-Model by Default
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Allow AI to generate on-model images for new products
                    </p>
                  </div>
                  <Switch
                    checked={settings.defaultAllowWear}
                    onCheckedChange={(checked) => updateSetting('defaultAllowWear', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Save */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Auto-save Analysis Results
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically save completed analysis to history
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                  />
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Analysis Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Show toast notifications for completed analysis
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => updateSetting('notifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Button onClick={saveSettings} className="flex-1">
                  Save Settings
                </Button>
                <Button onClick={resetSettings} variant="outline">
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environment & Status */}
        <div className="space-y-6">
          {/* Environment Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Environment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Gemini API Key */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Gemini API Key</div>
                  <div className="text-xs text-muted-foreground">
                    Required for AI processing
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasGeminiKey ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-success" />
                      <Badge variant="success">Connected</Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-destructive" />
                      <Badge variant="destructive">Missing</Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Python Environment */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Python Pipeline</div>
                  <div className="text-xs text-muted-foreground">
                    LangGraph processing engine
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <Badge variant="success">Ready</Badge>
                </div>
              </div>

              {/* Database */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-1">
                  <div className="text-sm font-medium">SQLite Database</div>
                  <div className="text-xs text-muted-foreground">
                    History storage
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <Badge variant="success">Connected</Badge>
                </div>
              </div>

              {!hasGeminiKey && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm font-medium text-warning">API Key Required</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set GEMINI_API_KEY in your environment to enable AI processing.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Default Category:</span>
                  <span className="font-medium">
                    {categories.find(c => c.value === settings.defaultCategory)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>On-Model Default:</span>
                  <span className="font-medium">
                    {settings.defaultAllowWear ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Auto-save:</span>
                  <span className="font-medium">
                    {settings.autoSave ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Notifications:</span>
                  <span className="font-medium">
                    {settings.notifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version Info */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>MSSS Version:</span>
                <span className="font-mono">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>LangGraph:</span>
                <span className="font-mono">0.1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>Jan 1, 2025</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}