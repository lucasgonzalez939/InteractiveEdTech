import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gameType: string;
  inputType: 'keyboard' | 'mouse';
  difficulty: 'easy' | 'medium' | 'hard';
  bgColor: string;
  route: string;
}

export default function GameCard({
  title,
  description,
  icon,
  gameType,
  inputType,
  difficulty,
  bgColor,
  route
}: GameCardProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-mint text-white';
      case 'medium': return 'bg-warning text-white';
      case 'hard': return 'bg-plum text-white';
      default: return 'bg-mint text-white';
    }
  };

  const getInputTypeColor = (type: string) => {
    return type === 'keyboard' ? 'bg-yellow text-dark' : 'bg-plum text-white';
  };

  return (
    <Card className="hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
      <CardContent className="p-6 text-center">
        <div className={`${bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
          {icon}
        </div>
        
        <h3 className="text-xl font-fredoka text-dark mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="flex justify-center space-x-2 mb-4">
          <Badge className={getInputTypeColor(inputType)}>
            {inputType === 'keyboard' ? 'Teclado' : 'Mouse'}
          </Badge>
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil'}
          </Badge>
        </div>
        
        <Link href={route}>
          <Button className={`${bgColor} hover:opacity-80 text-white font-bold transition-all duration-300 hover:scale-105`}>
            ¡Jugar!
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
