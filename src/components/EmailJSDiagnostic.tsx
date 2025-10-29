import { useState, useEffect } from 'react';
import { X, Settings, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { loadEmailJS } from '../utils/loadEmailJS';

interface TestResult {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  details: string[];
}

export function EmailJSDiagnostic() {
  const [isOpen, setIsOpen] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [templateAdmin, setTemplateAdmin] = useState('template_booking_admin');
  const [templateClient, setTemplateClient] = useState('template_booking_client');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoadingLib, setIsLoadingLib] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([
    { id: 1, name: 'Chargement EmailJS', status: 'pending', message: 'En attente...', details: [] },
    { id: 2, name: 'Initialisation', status: 'pending', message: 'En attente...', details: [] },
    { id: 3, name: 'Validation des clés', status: 'pending', message: 'En attente...', details: [] },
    { id: 4, name: 'Template Admin', status: 'pending', message: 'En attente...', details: [] },
    { id: 5, name: 'Template Client', status: 'pending', message: 'En attente...', details: [] },
    { id: 6, name: 'Capacité d\'envoi', status: 'pending', message: 'En attente...', details: [] },
  ]);

  // Charger EmailJS au montage du composant
  useEffect(() => {
    if (isOpen && !window.emailjs && !isLoadingLib) {
      setIsLoadingLib(true);
      loadEmailJS()
        .then(() => {
          console.log('EmailJS prêt pour le diagnostic');
          setIsLoadingLib(false);
        })
        .catch((error) => {
          console.error('Erreur chargement EmailJS:', error);
          setIsLoadingLib(false);
        });
    }
  }, [isOpen, isLoadingLib]);

  const updateTest = (id: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map(test => 
      test.id === id ? { ...test, ...updates } : test
    ));
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runDiagnostic = async () => {
    if (!publicKey || !serviceId) {
      alert('⚠️ Veuillez remplir au moins la Public Key et le Service ID !');
      return;
    }

    setIsRunning(true);
    setProgress(0);

    // Reset tests
    setTests([
      { id: 1, name: 'Chargement EmailJS', status: 'pending', message: 'En attente...', details: [] },
      { id: 2, name: 'Initialisation', status: 'pending', message: 'En attente...', details: [] },
      { id: 3, name: 'Validation des clés', status: 'pending', message: 'En attente...', details: [] },
      { id: 4, name: 'Template Admin', status: 'pending', message: 'En attente...', details: [] },
      { id: 5, name: 'Template Client', status: 'pending', message: 'En attente...', details: [] },
      { id: 6, name: 'Capacité d\'envoi', status: 'pending', message: 'En attente...', details: [] },
    ]);

    try {
      // Test 1: Chargement EmailJS
      updateTest(1, { status: 'running', message: 'Vérification...' });
      setProgress(0);
      
      if (window.emailjs) {
        updateTest(1, { 
          status: 'success', 
          message: '✅ EmailJS chargé',
          details: ['La librairie EmailJS est disponible']
        });
      } else {
        updateTest(1, { 
          status: 'error', 
          message: '❌ EmailJS non chargé',
          details: ['Le CDN EmailJS n\'est pas accessible']
        });
        setIsRunning(false);
        return;
      }
      await sleep(500);

      // Test 2: Initialisation
      updateTest(2, { status: 'running', message: 'Initialisation...' });
      setProgress(16);
      
      try {
        window.emailjs.init({
          publicKey: publicKey,
          blockHeadless: true,
        });
        updateTest(2, { 
          status: 'success', 
          message: '✅ Initialisé',
          details: [`Public Key: ${publicKey}`, `Service ID: ${serviceId}`]
        });
      } catch (error: any) {
        updateTest(2, { 
          status: 'error', 
          message: '❌ Erreur d\'initialisation',
          details: [error.message]
        });
        setIsRunning(false);
        return;
      }
      await sleep(500);

      // Test 3: Validation des clés
      updateTest(3, { status: 'running', message: 'Test des clés...' });
      setProgress(33);
      
      try {
        await window.emailjs.send(
          serviceId,
          'template_validation_test_fictif',
          { test: 'validation' }
        ).catch((error: any) => {
          if (error.status === 404) {
            updateTest(3, { 
              status: 'error', 
              message: '❌ Clés invalides (404)',
              details: [
                'Vos clés ne sont pas valides',
                'Vérifiez: https://dashboard.emailjs.com/admin/account'
              ]
            });
            throw new Error('Clés invalides');
          } else if (error.status === 422) {
            updateTest(3, { 
              status: 'success', 
              message: '✅ Clés valides',
              details: ['Les clés sont correctes', 'Le template de test n\'existe pas (normal)']
            });
          } else if (error.status === 403) {
            updateTest(3, { 
              status: 'error', 
              message: '❌ Accès refusé (403)',
              details: ['Vérifiez vos clés']
            });
            throw new Error('Accès refusé');
          } else {
            updateTest(3, { 
              status: 'success', 
              message: '✅ Clés valides',
              details: [`Code: ${error.status}`]
            });
          }
        });
      } catch (error: any) {
        if (error.message === 'Clés invalides' || error.message === 'Accès refusé') {
          setIsRunning(false);
          return;
        }
      }
      await sleep(500);

      // Test 4: Template Admin
      updateTest(4, { status: 'running', message: 'Test template admin...' });
      setProgress(50);
      
      try {
        await window.emailjs.send(
          serviceId,
          templateAdmin,
          {
            client_name: 'Test Diagnostic',
            client_email: 'test@example.com',
            phone_number: '+262 692 00 00 00',
            company_name: 'Test Company',
            message: 'Test automatique',
            appointment_date: '1er janvier 2025',
            appointment_time: '14:00',
            appointment_id: 'TEST-001',
            created_date: new Date().toLocaleString('fr-FR')
          }
        );
        
        updateTest(4, { 
          status: 'success', 
          message: '✅ Template admin OK',
          details: ['Le template existe et fonctionne', 'Un email de test a été envoyé']
        });
      } catch (error: any) {
        if (error.status === 422) {
          updateTest(4, { 
            status: 'error', 
            message: '❌ Template non trouvé',
            details: [
              `Le template "${templateAdmin}" n'existe pas`,
              'Créez-le sur: https://dashboard.emailjs.com/admin/templates'
            ]
          });
        } else {
          updateTest(4, { 
            status: 'error', 
            message: `❌ Erreur ${error.status}`,
            details: [error.text || error.message]
          });
        }
      }
      await sleep(500);

      // Test 5: Template Client
      updateTest(5, { status: 'running', message: 'Test template client...' });
      setProgress(66);
      
      try {
        await window.emailjs.send(
          serviceId,
          templateClient,
          {
            client_name: 'Test Diagnostic',
            client_email: 'test@example.com',
            client_phone: '+262 692 00 00 00',
            client_company: 'Test Company',
            client_message: 'Test automatique',
            appointment_date: '1er janvier 2025',
            appointment_time: '14:00',
            appointment_id: 'TEST-001',
            created_date: new Date().toLocaleString('fr-FR'),
            cancel_url: 'https://example.com/cancel'
          }
        );
        
        updateTest(5, { 
          status: 'success', 
          message: '✅ Template client OK',
          details: ['Le template existe et fonctionne', 'Un email de test a été envoyé']
        });
      } catch (error: any) {
        if (error.status === 422) {
          updateTest(5, { 
            status: 'error', 
            message: '❌ Template non trouvé',
            details: [
              `Le template "${templateClient}" n'existe pas`,
              'Créez-le sur: https://dashboard.emailjs.com/admin/templates'
            ]
          });
        } else {
          updateTest(5, { 
            status: 'error', 
            message: `❌ Erreur ${error.status}`,
            details: [error.text || error.message]
          });
        }
      }
      await sleep(500);

      // Test 6: Résumé
      updateTest(6, { status: 'running', message: 'Analyse finale...' });
      setProgress(83);
      
      const failedTests = tests.filter(t => t.status === 'error').length;
      
      if (failedTests === 0) {
        updateTest(6, { 
          status: 'success', 
          message: '✅ Configuration parfaite !',
          details: ['Tous les tests sont passés', 'Votre système d\'email est opérationnel']
        });
      } else {
        updateTest(6, { 
          status: 'error', 
          message: `⚠️ ${failedTests} problème(s) détecté(s)`,
          details: ['Corrigez les erreurs ci-dessus']
        });
      }
      
      setProgress(100);

    } catch (error: any) {
      console.error('Erreur diagnostic:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group"
        title="Diagnostic EmailJS"
      >
        <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          !
        </span>
      </button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-600" />
              Diagnostic EmailJS
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Configuration */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg">Configuration EmailJS</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publicKey">Public Key *</Label>
                  <Input
                    id="publicKey"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    placeholder="UYr2wdCd6_5qMv9XW ou user_xxxxx"
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor="serviceId">Service ID *</Label>
                  <Input
                    id="serviceId"
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    placeholder="service_yloo4dm"
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor="templateAdmin">Template Admin</Label>
                  <Input
                    id="templateAdmin"
                    value={templateAdmin}
                    onChange={(e) => setTemplateAdmin(e.target.value)}
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor="templateClient">Template Client</Label>
                  <Input
                    id="templateClient"
                    value={templateClient}
                    onChange={(e) => setTemplateClient(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm">
                <p className="text-blue-800">
                  💡 <strong>Récupérez vos clés :</strong>
                </p>
                <ul className="mt-2 space-y-1 text-blue-700">
                  <li>• Public Key: <a href="https://dashboard.emailjs.com/admin/account" target="_blank" rel="noopener noreferrer" className="underline">EmailJS Account</a></li>
                  <li>• Service ID: <a href="https://dashboard.emailjs.com/admin/integration" target="_blank" rel="noopener noreferrer" className="underline">EmailJS Integration</a></li>
                </ul>
              </div>

              <Button
                onClick={runDiagnostic}
                disabled={isRunning || !publicKey || !serviceId || isLoadingLib}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoadingLib ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chargement EmailJS...
                  </>
                ) : isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Diagnostic en cours...
                  </>
                ) : (
                  <>
                    🚀 Lancer le Diagnostic
                  </>
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Results Summary */}
            {(successCount > 0 || errorCount > 0) && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-700">{tests.length}</div>
                  <div className="text-sm text-gray-600">Tests Total</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <div className="text-sm text-green-700">Réussis</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                  <div className="text-sm text-red-700">Échoués</div>
                </div>
              </div>
            )}

            {/* Tests Results */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Résultats des Tests</h3>
              
              {tests.map((test) => (
                <div
                  key={test.id}
                  className={`border-l-4 p-4 rounded-r-lg ${
                    test.status === 'success' ? 'bg-green-50 border-green-500' :
                    test.status === 'error' ? 'bg-red-50 border-red-500' :
                    test.status === 'running' ? 'bg-blue-50 border-blue-500' :
                    'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{test.name}</h4>
                        <span className={`text-sm ${
                          test.status === 'success' ? 'text-green-600' :
                          test.status === 'error' ? 'text-red-600' :
                          test.status === 'running' ? 'text-blue-600' :
                          'text-gray-500'
                        }`}>
                          {test.message}
                        </span>
                      </div>
                      {test.details.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          {test.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Recommendation */}
            {successCount === tests.length && !isRunning && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-green-800 mb-2">🎉 Excellent ! Tout fonctionne !</h3>
                <p className="text-green-700 text-sm mb-3">
                  Votre configuration EmailJS est parfaite. Copiez vos clés dans <code className="bg-green-100 px-2 py-1 rounded">/components/EmailJSService.tsx</code> :
                </p>
                <div className="bg-white p-3 rounded font-mono text-sm">
                  <div>const EMAILJS_DIRECT_CONFIG = {'{'}</div>
                  <div className="ml-4">publicKey: '{publicKey}',</div>
                  <div className="ml-4">serviceId: '{serviceId}',</div>
                  <div>{'};'}</div>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`const EMAILJS_DIRECT_CONFIG = {\n  publicKey: '${publicKey}',\n  serviceId: '${serviceId}',\n};`);
                    alert('✅ Configuration copiée !');
                  }}
                  className="mt-3 w-full"
                  variant="outline"
                >
                  📋 Copier la Configuration
                </Button>
              </div>
            )}

            {errorCount > 0 && !isRunning && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Actions Recommandées
                </h3>
                <ul className="text-yellow-700 text-sm space-y-2">
                  {tests.some(t => t.status === 'error' && t.id <= 3) && (
                    <li>• Vérifiez vos clés sur <a href="https://dashboard.emailjs.com/admin/account" target="_blank" rel="noopener noreferrer" className="underline">EmailJS Dashboard</a></li>
                  )}
                  {tests.some(t => t.status === 'error' && t.id > 3) && (
                    <li>• Créez les templates manquants sur <a href="https://dashboard.emailjs.com/admin/templates" target="_blank" rel="noopener noreferrer" className="underline">EmailJS Templates</a></li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    emailjs?: any;
  }
}
