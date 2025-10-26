import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Save, X, Image as ImageIcon, Calendar, Tag, Link as LinkIcon } from 'lucide-react';
import { PACKAGE } from '../constants';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { toast } from '../hooks/use-toast';

const DetailsPanel = ({ game, isAddingNew, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    description: '',
    image: '',
    platform: '',
    releaseDate: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileObjectId, setProfileObjectId] = useState(null);
  
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  useEffect(() => 
  {
    if(game && !isAddingNew)
    {
      setFormData(
      {
          name: game.name || '',
          link: game.link || '',
          description: game.description || '',
          image: game.image  || '',
          platform: game.platform || ''
      });
    }
    else
    {
      setFormData(
      {
          name: '',
          link: '',
          description: '',
          image: '',
          platform:  ''
      });
    }
    
    const fetchProfileObjectId = async () => {
      if (!account?.address) return;

      try {
        const ownedObjects = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: PACKAGE.PROFILETYPE
          },
          options: {
            showType: true,
            showContent: true,
          },
        });

        if (ownedObjects.data.length > 0) {
          setProfileObjectId(ownedObjects.data[0].data.objectId);
        } else {
          toast({
            title: 'Profile Not Found!',
            description: 'Please create a profile first.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfileObjectId();
  }, [account, suiClient, game, isAddingNew]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateGame = (e) => 
  {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a game name!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create transaction
      const tx = new Transaction();
      
      tx.moveCall(
      {
        target: `${PACKAGE.PACKAGEID}::${PACKAGE.MODULENAME}::${PACKAGE.UPDATEGAMEFUNC}`,
        arguments: [
          tx.object(profileObjectId),
          tx.object(game.id),                    // mut profile: GameDevCardProfile
          tx.pure.string(formData.name),                 // game_name: String
          tx.pure.string(formData.link),             // game_link: String
          tx.pure.string(formData.description || ''),    // description: String
          tx.pure.string(formData.image || ''),       // image_url: String
          tx.pure.string(formData.platform || ''),       // platform: String
        ],
      });

      // Sign and execute transaction
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => 
          {
            console.log('Game updated successfully:', result);
            
            toast({
              title: 'Game Updated! 🎮',
              description: `${formData.name} has been updated on your portfolio.`,
            });

            setFormData(
            {
              name: '',
              gameLink: '',
              description: '',
              imageUrl: '',
              platform: '',
            });

            if (onSave) {
              onSave(formData);
            }

            setIsSubmitting(false);
            
          },
          onError: (error) => {
            console.error('Error adding game:', error);
            
            toast({
              title: 'Failed to Add Game!',
              description: error.message || 'An error occurred. Please try again.',
              variant: 'destructive',
            });
            
            setIsSubmitting(false);
          },
        }
      );
    } catch (error) 
    {
      console.error('Transaction error:', error);
      
      toast(
      {
        title: 'Transaction Error!',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
      
      setIsSubmitting(false);
    }


  };

  const handleSubmit = (e) => 
  {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a game name!');
      return;
    }

    const gameData = 
    {
      ...formData
    };

    setIsSubmitting(true);

    try {
      // Create transaction
      const tx = new Transaction();
      
      tx.moveCall(
      {
        target: `${PACKAGE.PACKAGEID}::${PACKAGE.MODULENAME}::${PACKAGE.ADDGAMEFUNC}`,
        arguments: [
          tx.object(profileObjectId),                    // mut profile: GameDevCardProfile
          tx.pure.string(formData.name),                 // game_name: String
          tx.pure.string(formData.link),             // game_link: String
          tx.pure.string(formData.description || ''),    // description: String
          tx.pure.string(formData.image || ''),       // image_url: String
          tx.pure.string(formData.platform || ''),       // platform: String
        ],
      });

      // Sign and execute transaction
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => 
          {
            console.log('Game added successfully:', result);
            
            toast({
              title: 'Game Added! 🎮',
              description: `${formData.name} has been added to your portfolio.`,
            });

            setFormData(
            {
              name: '',
              gameLink: '',
              description: '',
              imageUrl: '',
              platform: '',
            });

            if (onSave) {
              onSave(formData);
            }

            setIsSubmitting(false);
          },
          onError: (error) => {
            console.error('Error adding game:', error);
            
            toast({
              title: 'Failed to Add Game!',
              description: error.message || 'An error occurred. Please try again.',
              variant: 'destructive',
            });
            
            setIsSubmitting(false);
          },
        }
      );
    } catch (error) 
    {
      console.error('Transaction error:', error);
      
      toast(
      {
        title: 'Transaction Error!',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
      
      setIsSubmitting(false);
    }
  };

  if (!game && !isAddingNew) 
  {
    return (
      <div className="bg-slate-800/80 border-4 border-pink-500 pixel-border backdrop-blur-sm h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center p-12">
          <div className="text-8xl mb-6 animate-bounce">📜</div>
          <h3 className="text-3xl font-bold pixel-text text-pink-300 mb-4">GAME SHEET</h3>
          <p className="text-lg font-mono text-slate-400">Select a game from your inventory</p>
          <p className="text-lg font-mono text-slate-400">or add a new one to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/80 border-4 border-pink-500 pixel-border backdrop-blur-sm h-[calc(100vh-200px)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-yellow-600 p-4 border-b-4 border-pink-400">
        <h2 className="text-2xl font-bold pixel-text text-white">
          {isAddingNew ? 'NEW GAME' : 'GAME DETAILS'}
        </h2>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={isAddingNew ? handleSubmit : handleUpdateGame} className="space-y-6">
          {/* Game Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg font-mono text-yellow-300 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              GAME NAME *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter game name..."
              className="pixel-input bg-slate-900 border-2 border-cyan-500 text-white placeholder:text-slate-500 focus:border-yellow-400 font-mono text-lg p-4"
              required
            />
          </div>

          {/* Game Link */}
          <div className="space-y-2">
            <Label htmlFor="link" className="text-lg font-mono text-yellow-300 flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              GAME LINK
            </Label>
            <Input
              id="link"
              name="link"
              type="url"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://..."
              className="pixel-input bg-slate-900 border-2 border-cyan-500 text-white placeholder:text-slate-500 focus:border-yellow-400 font-mono p-4"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-lg font-mono text-yellow-300">
              DESCRIPTION
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your game..."
              rows={4}
              className="pixel-input bg-slate-900 border-2 border-cyan-500 text-white placeholder:text-slate-500 focus:border-yellow-400 font-mono resize-none"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-lg font-mono text-yellow-300 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              IMAGE URL
            </Label>
            <Input
              id="image"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://..."
              className="pixel-input bg-slate-900 border-2 border-cyan-500 text-white placeholder:text-slate-500 focus:border-yellow-400 font-mono p-4"
            />
            {formData.image && (
              <div className="mt-3 border-4 border-slate-600 bg-slate-950 p-2">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-48 object-cover pixel-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <Label htmlFor="platform" className="text-lg font-mono text-yellow-300">
              PLATFORM
            </Label>
            <Input
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              placeholder="PC, PS5, Xbox, Switch..."
              className="pixel-input bg-slate-900 border-2 border-cyan-500 text-white placeholder:text-slate-500 focus:border-yellow-400 font-mono p-4"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 pixel-button border-4 border-red-500 bg-red-700 hover:bg-red-600 text-white py-6 text-lg font-bold"
            >
              <X className="w-5 h-5 mr-2" />
              CANCEL
            </Button>
            <Button
              type="submit"
              className="flex-1 pixel-button bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white border-4 border-green-400 py-6 text-lg font-bold shadow-[0_6px_0_rgba(0,0,0,0.3)] hover:shadow-[0_3px_0_rgba(0,0,0,0.3)] active:shadow-[0_1px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 active:translate-y-1 transition-all duration-150"
            >
              <Save className="w-5 h-5 mr-2" />
              {isAddingNew ? 'SAVE GAME' : 'UPDATE GAME'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DetailsPanel;