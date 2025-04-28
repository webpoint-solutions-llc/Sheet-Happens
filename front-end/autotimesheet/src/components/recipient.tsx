import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";

const Recipient = ({ csvData }) => {
  const [emailInput, setEmailInput] = useState("");
  const [recipients, setRecipients] = useState([]);

  const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
  };

  const handleAddRecipient = () => {
    if (!emailInput.trim()) {
      return;
    }

    // Split by commas and process each email
    const emails = emailInput.split(",").map((email) => email.trim());

    const newRecipients = [];

    emails.forEach((email) => {
      if (!validateEmail(email)) {
        return;
      }

      // Check if email already exists
      if (
        recipients.some((r) => r.email.toLowerCase() === email.toLowerCase())
      ) {
        return;
      }

      // Generate a name from the email (before the @ symbol)
      const name = email
        .split("@")[0]
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

      newRecipients.push({
        name,
        email,
        selected: false,
      });
    });

    if (newRecipients.length > 0) {
      setRecipients([...recipients, ...newRecipients]);
      setEmailInput("");
    }
  };

  const handleRemoveRecipient = (email) => {
    setRecipients(recipients.filter((r) => r.email !== email));
  };

  const handleToggleSelected = (email) => {
    setRecipients(
      recipients.map((r) =>
        r.email === email ? { ...r, selected: !r.selected } : r,
      ),
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  const handleSend = async () => {
    // Collect the selected recipients
    const selectedRecipients = recipients.filter((r) => r.selected);

    if (selectedRecipients.length === 0) {
      alert("Please select at least one recipient.");
      return;
    }

    try {
      const response = await fetch("/api/sendCsv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvData,
          recipients: selectedRecipients,
        }),
      });

      if (response.ok) {
        alert("CSV sent successfully!");
      } else {
        alert("Failed to send CSV.");
      }
    } catch (error) {
      console.error("Error sending CSV:", error);
      alert("An error occurred while sending the CSV.");
    }
  };

  return (
    <div>
      <Card className="w-[350px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-gray-700">
            Sheet It Out
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Emails, Comma Separated"
              className="border border-gray-300 text-sm"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            onClick={handleAddRecipient}
          >
            + Add Recipient
          </Button>

          <div className="mt-2">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Added Recipients ({recipients.length})
            </h3>
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`/placeholder.svg?height=32&width=32&text=${recipient.name.charAt(0)}`}
                      alt={recipient.name}
                    />
                    <AvatarFallback>{recipient.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-gray-700 text-sm">
                      {recipient.name}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {recipient.email}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">Default</span>
                    <Checkbox
                      checked={recipient.selected}
                      onCheckedChange={() =>
                        handleToggleSelected(recipient.email)
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveRecipient(recipient.email)}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!recipients.some((r) => r.selected)}
              onClick={handleSend}
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recipient;
