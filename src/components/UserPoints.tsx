import { useState, useEffect } from "react";
import { Star, Gift, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserPointsProps {
  showHeader?: boolean;
  compact?: boolean;
}

const UserPoints = ({ showHeader = true, compact = false }: UserPointsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [points, setPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserPoints();
      loadPointsHistory();
    }
  }, [user]);

  const loadUserPoints = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setPoints(data?.points || 0);
    } catch (error) {
      console.error('Error loading points:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPointsHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPointsHistory(data || []);
    } catch (error) {
      console.error('Error loading points history:', error);
    }
  };

  const getTierInfo = (points: number) => {
    if (points >= 10000) return { tier: "Diamante", color: "from-blue-500 to-purple-600", icon: Award };
    if (points >= 5000) return { tier: "Ouro", color: "from-yellow-400 to-orange-500", icon: Star };
    if (points >= 2000) return { tier: "Prata", color: "from-gray-400 to-gray-600", icon: TrendingUp };
    return { tier: "Bronze", color: "from-orange-400 to-red-500", icon: Gift };
  };

  const pointsToNextTier = (points: number) => {
    if (points < 2000) return 2000 - points;
    if (points < 5000) return 5000 - points;
    if (points < 10000) return 10000 - points;
    return 0;
  };

  const tierInfo = getTierInfo(points);
  const nextTierPoints = pointsToNextTier(points);
  const TierIcon = tierInfo.icon;

  if (loading) {
    return (
      <Card className={compact ? "" : "shadow-card"}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border">
        <div className={`p-1 rounded-full bg-gradient-to-r ${tierInfo.color}`}>
          <TierIcon className="h-4 w-4 text-white" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold">{points.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">pts</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {tierInfo.tier}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="shadow-card">
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-full bg-gradient-to-r ${tierInfo.color}`}>
              <TierIcon className="h-5 w-5 text-white" />
            </div>
            Sistema de Pontos
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {points.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Pontos totais</div>
        </div>

        <div className="flex items-center justify-between">
          <Badge className={`bg-gradient-to-r ${tierInfo.color} text-white`}>
            Nível: {tierInfo.tier}
          </Badge>
          {nextTierPoints > 0 && (
            <div className="text-xs text-muted-foreground">
              {nextTierPoints.toLocaleString()} pts para próximo nível
            </div>
          )}
        </div>

        {nextTierPoints > 0 && (
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${tierInfo.color} transition-all duration-500`}
              style={{ 
                width: `${Math.min(100, ((points % (points >= 5000 ? 5000 : points >= 2000 ? 3000 : 2000)) / (points >= 5000 ? 5000 : points >= 2000 ? 3000 : 2000)) * 100)}%` 
              }}
            ></div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Histórico Recente</h4>
          {pointsHistory.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {pointsHistory.map((entry) => (
                <div key={entry.id} className="flex justify-between items-center text-xs p-2 bg-muted/50 rounded">
                  <div>
                    <div className="font-medium">{entry.description || entry.source}</div>
                    <div className="text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="font-bold text-primary">
                    +{entry.points}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center py-4">
              Nenhuma atividade ainda
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">💡 Dica</div>
          <div className="text-sm">
            Ganhe <strong>10 pontos</strong> a cada R$ 1,00 em compras!
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPoints;