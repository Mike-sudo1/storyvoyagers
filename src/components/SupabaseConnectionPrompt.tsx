import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, AlertCircle, CheckCircle } from "lucide-react";

const SupabaseConnectionPrompt = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-gradient-card border-0 shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 bg-orange-100 rounded-full w-fit mb-4">
            <Database className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="font-fredoka text-2xl">
            Supabase Connection Required
          </CardTitle>
          <Badge variant="outline" className="border-orange-200 text-orange-700 font-fredoka w-fit mx-auto">
            <AlertCircle className="h-3 w-3 mr-1" />
            Setup Required
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">
              To enable authentication, data storage, and all the amazing features of Meroe,
              you need to connect your Supabase project.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-fredoka font-semibold text-lg">Quick Setup Steps:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Click the green Supabase button</p>
                  <p className="text-sm text-muted-foreground">Located in the top-right corner of the Lovable interface</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Connect to Supabase</p>
                  <p className="text-sm text-muted-foreground">Follow the prompts to link your Supabase project or create a new one</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Deploy the database schema</p>
                  <p className="text-sm text-muted-foreground">Run the migration to set up tables for users, stories, and profiles</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-success">Ready to explore!</p>
                  <p className="text-sm text-muted-foreground">Once connected, you'll have access to authentication, data persistence, and AI avatar creation</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg">
            <h4 className="font-fredoka font-semibold mb-2">What you'll get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✅ User authentication and secure accounts</li>
              <li>✅ Persistent story library and progress tracking</li>
              <li>✅ Child profile management with cartoon avatars</li>
              <li>✅ AI-powered photo-to-cartoon conversion</li>
              <li>✅ Secure data storage and privacy protection</li>
            </ul>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Don't worry - this is a one-time setup and takes just a few minutes!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseConnectionPrompt;