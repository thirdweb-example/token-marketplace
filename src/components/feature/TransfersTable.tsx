import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function TransfersTable({
  tokenData,
  getCurrentItems,
  currentPage,
  itemsPerPage,
  handlePrevPage,
  handleNextPage,
  chainExplorer,
  tokenSymbol,
  isLoading,
}: {
  tokenData: any;
  getCurrentItems: () => any[];
  currentPage: number;
  itemsPerPage: number;
  handlePrevPage: () => void;
  handleNextPage: () => void;
  chainExplorer: string;
  tokenSymbol: string;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-2xl overflow-hidden mb-10 mt-2">
  <div className="p-4 pt-0">
        <h2 className="text-lg font-bold mb-1 mt-4">Recent Transfers</h2>
        <p className="text-gray-400 text-base mb-2">View recent token transfers including sender, recipient, amount, block, and transaction details.</p>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-full w-full bg-[#121212]" />
          </div>
        ) : tokenData?.transfers ? (
          <div>
            <table className="w-full bg-[#121212] rounded-2xl overflow-hidden">
              <thead style={{ borderBottom: '1px solid rgb(38 38 38 / var(--tw-border-opacity, 1))' }}>
                <tr className="bg-[#121212]">
                  <th className="text-[#888888] text-sm font-medium px-6 py-4 text-left">From</th>
                  <th className="text-[#888888] text-sm font-medium px-6 py-4 text-left">To</th>
                  <th className="text-[#888888] text-sm font-medium px-6 py-4 text-left">Amount</th>
                  <th className="text-[#888888] text-sm font-medium px-6 py-4 text-left">Time</th>
                  <th className="text-[#888888] text-sm font-medium px-6 py-4 text-left">Block</th>
                  <th className="text-[#888888] text-sm font-medium px-6 py-4 text-left">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentItems().map((transfer, index) => (
                  <tr
                    key={index}
                    className="bg-[#121212] border-b hover:bg-[#232329] transition"
                    style={{ borderBottomColor: 'rgb(38 38 38 / var(--tw-border-opacity, 1))' }}
                  >
                    <td className="font-mono text-sm font-medium text-white px-6 py-4">
                      <a
                        href={`${chainExplorer}/address/${transfer.from}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3861FB] hover:text-blue-400"
                      >
                        {transfer.from.slice(0, 6)}...{transfer.from.slice(-4)}
                      </a>
                    </td>
                    <td className="font-mono text-sm font-medium text-white px-6 py-4">
                      <a
                        href={`${chainExplorer}/address/${transfer.to}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3861FB] hover:text-blue-400"
                      >
                        {transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}
                      </a>
                    </td>
                    <td className="font-mono text-sm font-medium text-white px-6 py-4">
                      {Number.parseFloat(
                        transfer.formattedAmount,
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </td>
                    <td className="text-sm font-medium text-white px-6 py-4">
                      {new Date(transfer.timestamp).toLocaleString()}
                    </td>
                    <td className="font-mono text-sm font-medium text-white px-6 py-4">
                      <a
                        href={`${chainExplorer}/block/${transfer.blockNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3861FB] hover:text-blue-400"
                      >
                        {transfer.blockNumber}
                      </a>
                    </td>
                    <td className="font-mono text-sm font-medium text-white px-6 py-4">
                      <a
                        href={`${chainExplorer}/tx/${transfer.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3861FB] hover:text-blue-400"
                      >
                        {transfer.transactionHash.slice(0, 6)}...{transfer.transactionHash.slice(-4)}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4">
              <div className="text-xs text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  tokenData.transfers.length,
                )}{" "}
                of {tokenData.transfers.length} transfers
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="bg-transparent text-gray-300 hover:bg-[#232329] text-xs"
                  style={{ borderColor: 'rgb(38 38 38 / var(--tw-border-opacity, 1))' }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={
                    tokenData.transfers.length <= currentPage * itemsPerPage
                  }
                  className="bg-transparent text-gray-300 hover:bg-[#232329] text-xs"
                  style={{ borderColor: 'rgb(38 38 38 / var(--tw-border-opacity, 1))' }}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-red-400 flex items-center justify-center h-[300px]">
            <div className="text-center">
              <div className="text-xl font-medium mb-2">
                Failed to load transfers data
              </div>
              <div className="text-gray-400">Please try again later</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
