import React, { useState } from "react";
import { Button, InputField, Modal } from "@ffx/sdk";
import { SupabaseIntegration } from "@ffx/sdk/services";
import "./App.css";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [supabaseStatus, setSupabaseStatus] = useState<string>("Not tested");

  // Test service usage with real Supabase integration
  const supabase = new SupabaseIntegration({
    url: "https://demo.supabase.co", // Demo URL for testing
    anonKey: "demo-key", // Demo key for testing
  });

  const handleButtonClick = () => {
    console.log("Button clicked!");
    setShowModal(true);
  };

  const testSupabaseConnection = async () => {
    setSupabaseStatus("Testing connection...");
    try {
      const connectionInfo = supabase.getConnectionInfo();
      console.log("Supabase connection info:", connectionInfo);

      // Test health check (this will likely fail with demo credentials, but that's expected)
      const healthCheck = await supabase.healthCheck();
      console.log("Supabase health check:", healthCheck);

      if (healthCheck.healthy) {
        setSupabaseStatus("✅ Connected successfully!");
      } else {
        setSupabaseStatus(
          "⚠️ Connection failed (expected with demo credentials)"
        );
      }
    } catch (error) {
      console.error("Supabase test error:", error);
      setSupabaseStatus("❌ Error during test");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Flying Fox SDK Test Consumer
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* UI Components Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">UI Components</h2>

            <div className="space-y-4">
              <InputField
                label="Test Input"
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInputValue(e.target.value)
                }
                placeholder="Enter some text..."
              />

              <div className="flex gap-2">
                <Button variant="primary" onClick={handleButtonClick}>
                  Primary Button
                </Button>
                <Button variant="secondary" onClick={() => setShowModal(true)}>
                  Secondary Button
                </Button>
                <Button variant="danger" onClick={() => setShowModal(true)}>
                  Danger Button
                </Button>
              </div>
            </div>
          </div>

          {/* Blueprint Components Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Blueprint Components</h2>

            <div className="space-y-4">
              <p className="text-gray-600">
                Blueprint components will be available once internal imports are
                fixed.
              </p>
            </div>
          </div>

          {/* Hook Usage Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Hook Usage</h2>

            <div className="space-y-2">
              <p className="text-gray-600">
                Hooks will be available once internal imports are fixed.
              </p>
            </div>
          </div>

          {/* Service Usage Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Service Usage</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Supabase Service:{" "}
                  {supabase ? "Initialized" : "Not initialized"}
                </p>
                <p className="text-sm font-medium">Status: {supabaseStatus}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={testSupabaseConnection}
                  size="sm"
                >
                  Test Connection
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => console.log("Supabase:", supabase)}
                  size="sm"
                >
                  Log Service
                </Button>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                <p>
                  The connection test uses demo credentials and is expected to
                  fail.
                </p>
                <p>Check the browser console for detailed logs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Test */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Test Modal"
        >
          <p className="mb-4">This is a test modal from the Flying Fox SDK!</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Confirm
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default App;
