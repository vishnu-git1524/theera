"use client";
import React from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Modal from "./Modal";

type Props = { 
  projectId: string | null;  // projectId can be null
  disabled: boolean;         // Adding the 'disabled' prop
};

const InviteButton = ({ projectId, disabled }: Props) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Modal open={open} setOpen={setOpen}>
        <h1 className="text-xl font-semibold text-gray-800">
          Invite a team member!
        </h1>
        <p className="text-sm text-gray-500">
          Ask them to copy and paste this link into their browser:
        </p>
        <Input
          className="mt-4"
          readOnly
          onClick={() => {
            navigator.clipboard.writeText(
              `${process.env.NEXT_PUBLIC_URL}/join/${projectId}`
            );
            toast.success("Copied to clipboard!");
          }}
          value={`${process.env.NEXT_PUBLIC_URL}/join/${projectId}`}
        />
      </Modal>

      <Button 
        onClick={() => setOpen(true)} 
        variant="outline" 
        disabled={disabled}  // Passing disabled prop here
      >
        Invite a team member!
      </Button>
    </>
  );
};

export default InviteButton;
