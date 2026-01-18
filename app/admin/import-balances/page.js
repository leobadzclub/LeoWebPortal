'use client';

import { useState } from 'react';
import { useAuth } from '@/src/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Database, Upload, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { PLAYER_BALANCES } from '@/src/data/playerBalances';
import { setWalletBalance } from '@/src/lib/wallet';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function ImportBalancesPage() {
  const { user, userProfile } = useAuth();
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [excelData, setExcelData] = useState([]);
  
  const isAdmin = userProfile?.role === 'admin';

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedData = jsonData.map(row => ({
          name: row.Name || row.Player || row.name || '',
          balance: parseFloat(row.Balance || row.balance || 0),
        })).filter(p => p.name);

        setExcelData(parsedData);
        toast.success(`Excel loaded! ${parsedData.length} players found`);
      } catch (error) {
        console.error('Excel parse error:', error);
        toast.error('Failed to parse Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!user || !isAdmin) {
      toast.error('Admin access required');
      return;
    }

    const dataToImport = excelData.length > 0 ? excelData : PLAYER_BALANCES;

    setImporting(true);
    setImportStatus([]);
    const results = [];

    try {
      toast.info(`Starting import of ${dataToImport.length} players...`);

      for (const player of dataToImport) {
        try {
          // Create a unique ID based on player name (lowercase, no spaces)
          const userId = `player_${player.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
          const email = `${userId}@leobadminton.club`;

          await setWalletBalance(userId, player.balance, player.name, email);
          
          results.push({
            name: player.name,
            balance: player.balance,
            status: 'success',
          });

          setImportStatus([...results]);
        } catch (error) {
          results.push({
            name: player.name,
            balance: player.balance,
            status: 'error',
            error: error.message,
          });

          setImportStatus([...results]);
        }
      }

      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      setCompleted(true);
      toast.success(`Import completed! ${successCount} successful, ${errorCount} errors`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-white">Access Denied</h1>
        <p className="text-gray-400 mb-8">Admin privileges required</p>
        <Link href="/">
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900">Go to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-yellow-400" />
                <div>
                  <CardTitle className="text-2xl text-white">Import Player Balances</CardTitle>
                  <CardDescription className="text-gray-400">
                    Import {PLAYER_BALANCES.length} player balances from Excel data
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!completed ? (
                <>
                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm mb-2">
                      ⚠️ <strong>Important:</strong> This will import all player balance data
                    </p>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>{excelData.length > 0 ? excelData.length : PLAYER_BALANCES.length} players will be imported</li>
                      <li>Each player will get a wallet with their current balance</li>
                      <li>Existing wallets will be updated</li>
                      <li>All amounts are in CAD$</li>
                    </ul>
                  </div>

                  {/* Excel Upload */}
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Upload Excel File (Optional)
                    </h3>
                    <p className="text-sm text-gray-300 mb-3">
                      Excel must have columns: Name (or Player) and Balance
                    </p>
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      className="bg-gray-800 border-gray-700 text-white cursor-pointer"
                    />
                    {excelData.length > 0 && (
                      <p className="text-green-400 text-sm mt-2">
                        ✅ Excel loaded: {excelData.length} players ready to import
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleImport}
                    disabled={importing}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 font-semibold h-12"
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-navy-900 border-t-transparent mr-2"></div>
                        Importing... {importStatus.length}/{PLAYER_BALANCES.length}
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-2" />
                        Start Import
                      </>
                    )}
                  </Button>

                  {importing && importStatus.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <h3 className="text-white font-semibold mb-3">Import Progress:</h3>
                      <div className="space-y-1 text-sm">
                        {importStatus.slice(-10).map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-gray-300">{item.name}</span>
                            <span className="flex items-center gap-2">
                              <span className="text-yellow-400">CA$ {item.balance.toFixed(2)}</span>
                              {item.status === 'success' ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-400" />
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Import Completed!</h3>
                  <p className="text-gray-400 mb-6">
                    {importStatus.filter(r => r.status === 'success').length} players imported successfully
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <Link href="/admin/balance-management">
                      <Button className="bg-yellow-400 hover:bg-yellow-500 text-navy-900">
                        Go to Balance Management
                      </Button>
                    </Link>
                    <Link href="/weekly-schedule">
                      <Button variant="outline" className="border-gray-700">
                        View Weekly Schedule
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
