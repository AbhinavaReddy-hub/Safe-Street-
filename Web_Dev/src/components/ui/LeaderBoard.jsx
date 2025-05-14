import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"; // Adjust based on your UI library
import { TrendingUp } from "lucide-react"; // Optional icon for trend
import { Tooltip } from "recharts"; // To display additional info if needed

// Dummy Data (Replace with real data from your backend)
const leaderboardData = [
  { team: "Team Alpha", resolved: 250 },
  { team: "Team Beta", resolved: 180 },
  { team: "Team Gamma", resolved: 150 },
  { team: "Team Delta", resolved: 130 },
  { team: "Team Epsilon", resolved: 100 },
  { team: "Team Epsilon", resolved: 100 },
  { team: "Team Epsilon", resolved: 100 },
  { team: "Team Epsilon", resolved: 100 },

];

function LeaderBoard() {
  return (
   <div className="w-[450px] h-fit flex flex-col justify-center gap-2 rounded-2xl border bg-white p-4 shadow border-none">
      <div className="self-center font-serif text-xl">
        <h2>Top Teams</h2>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between mx-2">
            <h3>Team Name</h3>
            <h3>Reports solved</h3>
        </div>
        {leaderboardData.map((val,id)=>{
          return (
            <div 
            key={id}
            className="flex justify-between mx-3"
            >
              <div className="flex gap-4">
                <div className="w-[30px] h-[30px] rounded-full border-amber-100 border-2 flex items-center justify-center bg-amber-50">{val.team[5]}</div>
                <h4>{val.team}</h4>
              </div>
              <div>{val.resolved}</div>
            </div>
          )
        })}
      </div>
   </div>
  );
}

export default LeaderBoard;
