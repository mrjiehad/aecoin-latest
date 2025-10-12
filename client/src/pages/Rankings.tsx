import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Star, Trophy, Crown, Medal, Sparkles } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { PlayerRanking } from "@shared/schema";

import sultan1 from "@assets/S2_1759294544784.png";
import sultan2 from "@assets/S1_1759294544782.png";
import sultan3 from "@assets/S3_1759294544785.png";
import cityBg from "@assets/stock_images/gta_5_cityscape_los__a8b6c683.jpg";

interface PlayerRankingWithUser extends PlayerRanking {
  user?: {
    username: string;
    avatar: string | null;
  };
}

const characterImages = [sultan1, sultan2, sultan3, sultan1, sultan2];

// Get current month name
const getCurrentMonth = () => {
  const months = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];
  return months[new Date().getMonth()];
};

export default function Rankings() {
  const { data: rankings = [], isLoading } = useQuery<PlayerRankingWithUser[]>({
    queryKey: ["/api/rankings"],
  });

  const currentMonth = getCurrentMonth();
  const top3 = rankings.slice(0, 3);
  const restOfRankings = rankings.slice(3);

  const getPodiumOrder = (rank: number) => {
    // Rank 1 = middle (order-2), Rank 2 = left (order-1), Rank 3 = right (order-3)
    if (rank === 1) return 'order-2';
    if (rank === 2) return 'order-1';
    return 'order-3';
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-neon-yellow";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-amber-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-[#000000]">
      <Header cartItemCount={0} onCartClick={() => {}} />
      
      {/* Hero Section with Background */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={cityBg} 
            alt="GTA City Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/80 via-[#000000]/90 to-[#000000]" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Title */}
          <div className="text-center mb-20">
            <div className="relative inline-block">
              {/* Animated Trophy */}
              <div className="relative mb-6">
                <Trophy className="w-24 h-24 text-neon-yellow mx-auto animate-pulse" 
                       style={{ filter: "drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))" }} />
                <Sparkles className="w-8 h-8 text-neon-yellow absolute -top-2 -right-2 animate-spin" 
                         style={{ animationDuration: "3s" }} />
                <Sparkles className="w-6 h-6 text-neon-yellow absolute -bottom-2 -left-2 animate-ping" />
              </div>
              
              {/* Dynamic Month Title */}
              <h1 className="text-6xl md:text-8xl font-russo text-white mb-2 uppercase" 
                  style={{ textShadow: "3px 3px 0px rgba(0,0,0,0.8), 0 0 40px rgba(255, 215, 0, 0.4)" }}
                  data-testid="title-rankings">
                SULTAN OF
              </h1>
              <h2 className="text-7xl md:text-9xl font-bebas text-neon-yellow mb-4" 
                  style={{ textShadow: "0 0 40px rgba(255, 215, 0, 0.6)" }}>
                {currentMonth}
              </h2>
              <div className="h-1 w-64 mx-auto bg-gradient-to-r from-transparent via-neon-yellow to-transparent" />
            </div>
            <p className="text-gray-300 font-russo text-xl uppercase tracking-widest mt-6">
              🏆 HALL OF LEGENDS 🏆
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-neon-yellow border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <p className="text-gray-400 text-2xl font-rajdhani">No rankings available yet</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {top3.length > 0 && (
                <div className="mb-24">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-end">
                    {top3.map((player, index) => {
                      const orderClass = getPodiumOrder(player.rank);
                      const isWinner = player.rank === 1;
                      const heightClass = player.rank === 1 ? 'min-h-[450px]' : player.rank === 2 ? 'min-h-[380px]' : 'min-h-[350px]';
                      // Use uploaded image if available, otherwise use default
                      const characterImage = player.imageUrl || characterImages[index % characterImages.length];
                      
                      return (
                        <div
                          key={player.id}
                          className={`${orderClass} relative group`}
                          data-testid={`podium-${player.rank}`}
                        >
                          <div className={`relative ${heightClass} bg-gradient-to-br from-[#1a1a1a] via-[#000000] to-black border-4 ${
                            isWinner ? 'border-neon-yellow' : 'border-white/20'
                          } rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 hover:border-neon-yellow`}
                          style={isWinner ? { 
                            boxShadow: "0 0 60px rgba(255, 215, 0, 0.4), inset 0 0 80px rgba(255, 215, 0, 0.1)" 
                          } : {
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
                          }}>
                            
                            {/* Character Background Image */}
                            <div className="absolute inset-0">
                              <img 
                                src={characterImage} 
                                alt={player.playerName}
                                className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
                                style={{ objectPosition: 'center' }}
                              />
                              <div className={`absolute inset-0 bg-gradient-to-t ${
                                isWinner 
                                  ? 'from-black via-black/90 to-transparent' 
                                  : 'from-black via-black/70 to-transparent'
                              }`} />
                            </div>

                            {/* Rank Badge */}
                            <div className="absolute top-6 right-6 z-10">
                              <div className={`w-16 h-16 rounded-full ${
                                isWinner ? 'bg-neon-yellow' : 'bg-gray-700'
                              } border-4 border-black flex items-center justify-center shadow-2xl`}>
                                <span className={`text-3xl font-bold font-bebas ${
                                  isWinner ? 'text-black' : 'text-white'
                                }`}>#{player.rank}</span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                              {/* Winner Crown Icon */}
                              {isWinner && (
                                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                                  <Crown className="w-16 h-16 fill-neon-yellow text-neon-yellow animate-bounce" 
                                         style={{ filter: "drop-shadow(0 0 20px rgba(255, 215, 0, 1))" }} />
                                </div>
                              )}
                              
                              {/* Player Name */}
                              <div className="text-center mb-4">
                                <p className={`${isWinner ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'} font-russo text-white tracking-wider mb-3 uppercase`} 
                                   data-testid={`player-name-${player.rank}`}
                                   style={isWinner ? { textShadow: "0 0 30px rgba(255, 215, 0, 0.8)" } : { textShadow: "0 2px 10px rgba(0, 0, 0, 0.8)" }}>
                                  {player.playerName}
                                </p>
                                <div className={`inline-block px-6 py-2 ${
                                  isWinner ? 'bg-neon-yellow text-black' : 'bg-white/10 border-2 border-white/30 text-white'
                                }`}>
                                  <span className={`font-russo font-bold text-sm uppercase tracking-wider`}>
                                    {isWinner ? '👑 CHAMPION 👑' : `RANK #${player.rank}`}
                                  </span>
                                </div>
                              </div>

                              {/* Stars - Max 10 displayed */}
                              <div className="flex gap-1.5 flex-wrap justify-center mb-3">
                                {Array.from({ length: Math.min(player.stars, 10) }).map((_, i) => (
                                  <Crown
                                    key={i}
                                    className={`${isWinner ? 'w-8 h-8' : 'w-7 h-7'} fill-neon-yellow text-neon-yellow`}
                                    style={{ filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 1))" }}
                                  />
                                ))}
                                {player.stars > 10 && (
                                  <span className={`${isWinner ? 'text-3xl' : 'text-2xl'} text-neon-yellow font-bold ml-2 font-bebas`}>
                                    +{player.stars - 10}
                                  </span>
                                )}
                              </div>
                              <p className={`text-neon-yellow font-bebas text-center ${
                                isWinner ? 'text-4xl' : 'text-3xl'
                              }`}>
                                ⭐ {player.stars} STARS
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rankings Table */}
              <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8">
                  <h3 className="text-4xl font-russo text-white uppercase mb-2" 
                      style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.8)" }}>
                    OTHER SULTANS
                  </h3>
                  <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-neon-yellow to-transparent" />
                </div>
                
                <div className="bg-gradient-to-br from-[#1a1a1a]/90 to-[#000000]/90 backdrop-blur-sm border-2 border-neon-yellow/20 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-neon-yellow/40 bg-black/60">
                          <th className="py-6 px-8 text-left font-russo text-xl text-neon-yellow uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="py-6 px-8 text-left font-russo text-xl text-neon-yellow uppercase tracking-wider">
                            Player
                          </th>
                          <th className="py-6 px-8 text-left font-russo text-xl text-neon-yellow uppercase tracking-wider">
                            Stars
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {restOfRankings.map((player, index) => {
                          // Use uploaded image if available, otherwise use default
                          const characterImage = player.imageUrl || characterImages[(index + 3) % characterImages.length];
                          
                          return (
                            <tr
                              key={player.id}
                              className="border-b border-neon-yellow/10 hover:bg-neon-yellow/5 hover:border-neon-yellow/30 transition-all duration-300 group relative"
                              data-testid={`row-rank-${player.rank}`}
                            >
                              <td className="py-6 px-8 relative">
                                {/* Background character image on hover */}
                                <div className="absolute inset-0 left-0 right-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none -z-10" style={{ width: 'calc(300%)' }}>
                                  <img 
                                    src={characterImage}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex items-center gap-4">
                                  {player.rank <= 6 && (
                                    <Medal className={`w-8 h-8 ${getMedalColor(player.rank)}`} />
                                  )}
                                  <span className={`text-3xl font-bold font-bebas ${getMedalColor(player.rank)}`}>
                                    #{player.rank}
                                  </span>
                                </div>
                              </td>
                              <td className="py-6 px-8 relative">
                                <div className="flex items-center gap-5">
                                  <div className="relative">
                                    <Avatar className="w-16 h-16 ring-4 ring-white/20 group-hover:ring-neon-yellow/60 transition-all shadow-xl">
                                      <AvatarImage src={player.user?.avatar || undefined} />
                                      <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white font-bold text-xl">
                                        {player.playerName.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <span className="text-2xl text-white font-russo font-bold group-hover:text-neon-yellow transition-colors uppercase" 
                                        data-testid={`player-name-${player.rank}`}>
                                    {player.playerName}
                                  </span>
                                </div>
                              </td>
                              <td className="py-6 px-8 relative">
                                <div className="flex items-center gap-3">
                                  <div className="flex gap-1.5">
                                    {Array.from({ length: Math.min(player.stars, 7) }).map((_, i) => (
                                      <Crown
                                        key={i}
                                        className="w-6 h-6 fill-neon-yellow text-neon-yellow"
                                        style={{ filter: "drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))" }}
                                      />
                                    ))}
                                    {player.stars > 7 && (
                                      <span className="text-neon-yellow font-bold text-xl ml-2 font-bebas">
                                        +{player.stars - 7}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-neon-yellow font-bebas text-2xl ml-2">
                                    {player.stars}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
