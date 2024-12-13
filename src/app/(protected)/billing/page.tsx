"use client";

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { createCheckouSession } from '@/lib/payment';
import { api } from '@/trpc/react';
import { Info, FileText, CreditCard } from 'lucide-react';
import React from 'react';

const Billing = () => {
    const { data: user } = api.project.getMyCredits.useQuery();
    const { data: transactions } = api.project.getTransactions.useQuery(); // Fetch transactions
    const [creditsToBuy, setcreditsToBuy] = React.useState<number[]>([100]);
    const creditsToBuyAmount = creditsToBuy[0]!;
    const price = (creditsToBuyAmount / 50).toFixed(2);

    return (
        <div>
            <h1 className="text-xl font-semibold">Billing</h1>
            <div className="h-2"></div>
            <p className="text-sm text-gray-500">
                You currently have {user?.credits} credits.
            </p>
            <div className="h-2"></div>
            <div className="bg-blue-50 px-4 py-2 rounded-md border border-blue-200 text-blue-700">
                <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm">Each credit allows you to index 1 file in a repository.</p>
                </div>
                <p className="text-sm">E.g. If your project has 100 files, you will need 100 credits to index it.</p>
            </div>

            <div className="h-4"></div>
            <Slider
                defaultValue={[100]}
                max={1000}
                min={10}
                step={10}
                value={creditsToBuy}
                onValueChange={(value) => setcreditsToBuy(value)}
            />

            <div className="h-4"></div>
            <Button
                onClick={() => {
                    createCheckouSession(creditsToBuyAmount);
                }}
            >
                Buy {creditsToBuyAmount} credits for ${price}
            </Button>

            {/* Transaction History Section */}
            <div className="h-8"></div>
            <h2 className="text-lg font-semibold">Transaction History</h2>
            <div className="h-2"></div>
            {transactions?.length ? (
                <div className="space-y-4">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex justify-between items-center p-4 border rounded-md"
                        >
                            <div className="flex items-center gap-2">
                                <CreditCard className="text-green-500" size={20} />
                                <div>
                                    <p className="text-sm font-medium">Credits Added</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(transaction.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <p className="text-green-600 font-semibold">+{transaction.credits} credits</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">
                    {transactions === undefined ? 'Loading transactions...' : 'No transactions found.'}
                </p>
            )}
        </div>
    );
};

export default Billing;
