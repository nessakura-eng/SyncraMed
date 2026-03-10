import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, Loader2, Pill, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

export default function Education() {
  const urlParams = new URLSearchParams(window.location.search);
  const medFromUrl = urlParams.get("med");

  const [selectedMed, setSelectedMed] = useState(medFromUrl || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [educationData, setEducationData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: medications = [], isLoading: medsLoading } = useQuery({
    queryKey: ["medications"],
    queryFn: () => base44.entities.Medication.list(),
  });

  useEffect(() => {
    if (medFromUrl) {
      generateEducation(medFromUrl);
    }
  }, [medFromUrl]);

  const generateEducation = async (medName) => {
    setSelectedMed(medName);
    setIsGenerating(true);
    setEducationData(null);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide comprehensive patient-friendly education about the medication "${medName}". Include the following sections:

1. **Overview** - What is this medication and what is it used for?
2. **Generic vs. Brand Name** - What are the generic and brand name versions? Are there cost differences?
3. **Common Side Effects** - List the most common side effects patients should know about
4. **Serious Side Effects** - What side effects require immediate medical attention?
5. **Pros & Cons** - What are the advantages and disadvantages of this medication?
6. **Common Conditions** - What medical conditions is this medication commonly prescribed for?
7. **Important Interactions** - What drugs, foods, or activities should be avoided?
8. **Tips for Patients** - Practical advice for taking this medication

Write in clear, easy-to-understand language. Use markdown formatting.`,
      response_json_schema: {
        type: "object",
        properties: {
          medication_name: { type: "string" },
          generic_name: { type: "string" },
          brand_names: { type: "array", items: { type: "string" } },
          drug_class: { type: "string" },
          full_education: { type: "string", description: "Full markdown-formatted education content" },
          quick_facts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "string" },
              },
            },
          },
        },
      },
    });

    setEducationData(result);
    setIsGenerating(false);
  };

  const filteredMeds = medications.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Medication Education</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Learn about your medications with AI-powered insights</p>
      </div>

      {!selectedMed && !isGenerating && !educationData ? (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search or type any medication name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  generateEducation(searchQuery.trim());
                }
              }}
              className="pl-9"
            />
          </div>

          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => generateEducation(searchQuery.trim())}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Learn about "{searchQuery}"
            </Button>
          )}

          {/* Med list */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Medications</p>
            {medsLoading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl mb-2" />)
            ) : filteredMeds.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No matching medications" : "Add medications to get personalized education"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMeds.map((med, i) => (
                  <motion.div
                    key={med.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card
                      className="p-4 cursor-pointer hover:border-foreground/20 transition-all"
                      onClick={() => generateEducation(med.name)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-semibold text-xs shrink-0"
                          style={{ backgroundColor: med.color || "#000" }}
                        >
                          {med.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{med.dosage}</p>
                        </div>
                        <BookOpen className="h-4 w-4 text-muted-foreground ml-auto" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setSelectedMed("");
              setEducationData(null);
              setSearchQuery("");
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to medications
          </Button>

          {isGenerating ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-sm font-medium">Generating education for {selectedMed}...</p>
                <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
              </div>
            </Card>
          ) : educationData ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{educationData.medication_name || selectedMed}</CardTitle>
                      {educationData.generic_name && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Generic: {educationData.generic_name}
                        </p>
                      )}
                    </div>
                    {educationData.drug_class && (
                      <Badge variant="secondary">{educationData.drug_class}</Badge>
                    )}
                  </div>
                </CardHeader>
                {educationData.brand_names?.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {educationData.brand_names.map((b) => (
                        <Badge key={b} variant="outline" className="text-xs">{b}</Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Quick Facts */}
              {educationData.quick_facts?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {educationData.quick_facts.map((fact, i) => (
                    <Card key={i} className="p-3">
                      <p className="text-xs text-muted-foreground">{fact.label}</p>
                      <p className="text-sm font-medium mt-0.5">{fact.value}</p>
                    </Card>
                  ))}
                </div>
              )}

              {/* Full Education */}
              <Card>
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-base prose-h2:font-bold prose-h2:text-foreground prose-h3:text-sm prose-h3:font-bold prose-h3:text-foreground prose-p:text-sm prose-p:text-muted-foreground prose-li:text-sm prose-li:text-muted-foreground prose-strong:text-foreground prose-strong:font-bold">
                    <ReactMarkdown>{educationData.full_education}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground text-center py-4">
                ⚕️ This information is AI-generated for educational purposes only. Always consult your healthcare provider for medical advice.
              </p>
            </motion.div>
          ) : null}
        </>
      )}
    </div>
  );
}
