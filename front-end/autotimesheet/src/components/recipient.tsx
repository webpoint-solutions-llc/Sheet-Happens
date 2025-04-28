import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Recipient = () => {
  return (
    <div>
      <Card className="w-[350px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-gray-700">
            Sheet It Out
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Emails, Comma Separated"
            className="border border-gray-300 text-sm"
          />
          <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
            + Add Recipient
          </Button>

          <div className="mt-2">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Added Recipients
            </h3>
            <div className="flex flex-col gap-3">
              {[
                {
                  name: "Olivia Rhye",
                  email: "olivia@untitledui.com",
                  selected: true,
                },
                { name: "Wade Warren", email: "michael.mitc@example.com" },
                {
                  name: "Kristin Watson",
                  email: "michelle.rivera@example.com",
                },
                { name: "Esther Howard", email: "kenzi.lawson@example.com" },
                { name: "Albert Flores", email: "tim.jennings@example.com" },
              ].map((recipient, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`/placeholder.svg?height=32&width=32&text=${recipient.name.charAt(
                        0
                      )}`}
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
                    <Checkbox defaultChecked={recipient.selected} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recipient;
