import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
}

interface ProductRatingProps {
  productId: string;
  currentRating: number;
  reviewsCount: number;
}

const ProductRating = ({ productId, currentRating, reviewsCount }: ProductRatingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasUserReview, setHasUserReview] = useState(false);

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkUserReview();
    }
  }, [productId, user]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkUserReview = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setHasUserReview(true);
        setUserRating(data.rating);
        setUserComment(data.comment || "");
      }
    } catch (error) {
      // No existing review
      setHasUserReview(false);
    }
  };

  const submitReview = async () => {
    if (!user || userRating === 0) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado e dar uma nota para avaliar.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        user_id: user.id,
        product_id: productId,
        rating: userRating,
        comment: userComment.trim() || null
      };

      if (hasUserReview) {
        const { error } = await supabase
          .from('product_reviews')
          .update(reviewData)
          .eq('product_id', productId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('product_reviews')
          .insert([reviewData]);

        if (error) throw error;
        setHasUserReview(true);
      }

      toast({
        title: "Avaliação salva!",
        description: "Obrigado por avaliar este produto."
      });

      setShowReviewForm(false);
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar avaliação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false, size = "w-4 h-4") => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-muted text-muted-foreground"
        } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
        onClick={interactive ? () => setUserRating(i + 1) : undefined}
      />
    ));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Avaliações
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">{renderStars(Math.round(currentRating))}</div>
            <span className="text-sm text-muted-foreground">
              {currentRating.toFixed(1)} ({reviewsCount} avaliações)
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Formulário de avaliação */}
        {user && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {hasUserReview ? "Sua avaliação" : "Avaliar produto"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? "Cancelar" : hasUserReview ? "Editar" : "Avaliar"}
              </Button>
            </div>

            {showReviewForm && (
              <div className="space-y-3 p-3 border rounded-lg">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Sua nota:</span>
                  <div className="flex gap-1">
                    {renderStars(userRating, true, "w-6 h-6")}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Comentário (opcional):</span>
                  <Textarea
                    placeholder="Compartilhe sua experiência com este produto..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <Button
                  onClick={submitReview}
                  disabled={loading || userRating === 0}
                  className="w-full"
                >
                  {loading ? "Salvando..." : hasUserReview ? "Atualizar Avaliação" : "Enviar Avaliação"}
                </Button>
              </div>
            )}
          </div>
        )}

        {!user && (
          <p className="text-sm text-muted-foreground text-center p-3 border rounded-lg">
            <a href="/auth" className="text-primary hover:underline">
              Faça login
            </a>{" "}
            para avaliar este produto
          </p>
        )}

        <Separator />

        {/* Lista de avaliações */}
        <div className="space-y-4">
          <h4 className="font-medium">Todas as Avaliações ({reviews.length})</h4>
          
          {reviews.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reviews.map((review) => (
                <div key={review.id} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {review.user_id.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <Badge variant="secondary" className="text-xs">
                          {review.rating}/5
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  {review.comment && (
                    <p className="text-sm text-muted-foreground pl-10">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Ainda não há avaliações para este produto. Seja o primeiro a avaliar!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductRating;