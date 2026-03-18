import React, { useState, useEffect } from "react";
import { apiUrl, PollData } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, BarChart3 } from "lucide-react";

interface PollWidgetProps {
  poll: PollData;
  language: "en" | "gu" | "hi";
}

export function PollWidget({ poll: initialPoll, language }: PollWidgetProps) {
  const [poll, setPoll] = useState<PollData>(initialPoll);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check local storage to see if user has already voted
    const votedPolls = JSON.parse(localStorage.getItem("voted_polls") || "{}");
    if (votedPolls[poll.id]) {
      setHasVoted(true);
      setSelectedOption(votedPolls[poll.id]);
    }
  }, [poll.id]);

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = async () => {
    if (!selectedOption || hasVoted) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(apiUrl(`/news/polls/${poll.id}/vote/`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option_id: selectedOption }),
      });
      
      if (!res.ok) throw new Error("Failed to vote");
      
      const data = await res.json();
      if (data.success && data.poll) {
        setPoll(data.poll);
        setHasVoted(true);
        
        // Save to local storage
        const votedPolls = JSON.parse(localStorage.getItem("voted_polls") || "{}");
        votedPolls[poll.id] = selectedOption;
        localStorage.setItem("voted_polls", JSON.stringify(votedPolls));
        
        toast({
          title: language === "en" ? "Vote Recorded" : "મત નોંધાયેલ છે",
          description: language === "en" ? "Thank you for sharing your opinion!" : "તમારો અભિપ્રાય શેર કરવા બદલ આભાર!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not submit your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!poll.is_active) return null;

  return (
    <div className="my-8 rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="bg-primary/5 border-b border-border p-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg text-foreground">
          {poll.question}
        </h3>
      </div>
      
      <div className="p-5 space-y-4">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isSelected = selectedOption === option.id;
          
          if (hasVoted) {
            // Results View
            return (
              <div key={option.id} className="relative">
                <div className="flex justify-between text-sm mb-1 font-medium z-10 relative">
                  <span className={`flex items-center gap-1.5 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {option.text}
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </span>
                  <span className="text-muted-foreground">{percentage}%</span>
                </div>
                <div className="h-8 w-full bg-secondary/30 rounded-md overflow-hidden relative">
                  <div 
                    className={`absolute pb-1 top-0 left-0 h-full rounded-md transition-all duration-1000 ease-out ${isSelected ? 'bg-primary/20' : 'bg-primary/10'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1 relative z-10">
                  {option.votes} {language === "en" ? "votes" : "મત"}
                </div>
              </div>
            );
          }
          
          // Voting View
          return (
            <label 
              key={option.id} 
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                isSelected 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                  : 'border-border hover:bg-secondary/20'
              }`}
            >
              <input
                type="radio"
                name={`poll-${poll.id}`}
                value={option.id}
                checked={isSelected}
                onChange={() => setSelectedOption(option.id)}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary h-4 w-4 shrink-0 mt-0.5 align-top Accent-primary"
              />
              <span className="ml-3 text-sm font-medium text-foreground block w-full cursor-pointer">
                {option.text}
              </span>
            </label>
          );
        })}
        
        {!hasVoted && (
          <button
            onClick={handleVote}
            disabled={!selectedOption || isSubmitting}
            className="w-full mt-4 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? (language === "en" ? "Submitting..." : "સબમિટ થઈ રહ્યું છે...") 
              : (language === "en" ? "Submit Vote" : "મત સબમિટ કરો")}
          </button>
        )}
        
        {hasVoted && (
          <div className="text-center text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
            {language === "en" ? `Total votes: ${totalVotes}` : `કુલ મત: ${totalVotes}`}
          </div>
        )}
      </div>
    </div>
  );
}
