"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateStudyMaterials } from "@/ai/flows/generate-summary";
import { extractTextFromFile } from "@/ai/flows/extract-text-from-file";
import {
  BrainCircuit,
  Clipboard,
  Copy,
  FileText,
  Layers3,
  Lightbulb,
  LoaderCircle,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

type Flashcard = {
  question: string;
  answer: string;
};

type CopiedStates = {
  summary?: boolean;
  concepts?: boolean;
  flashcards?: boolean;
};

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [keyConcepts, setKeyConcepts] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedStates, setCopiedStates] = useState<CopiedStates>({});
  const [hasGenerated, setHasGenerated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleCopy = (text: string, type: keyof CopiedStates) => {
    navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [type]: false }));
    }, 2000);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileDataUri = e.target?.result as string;
        if (!fileDataUri) return;

        setIsLoading(true);
        // Clear previous results
        setSummary("");
        setKeyConcepts([]);
        setFlashcards([]);
        setHasGenerated(false);
        setInputText("");

        try {
          const { text } = await extractTextFromFile({ fileDataUri });
          setInputText(text);
        } catch (error) {
          console.error("File parsing error:", error);
          toast({
            title: "File Processing Error",
            description: "Failed to extract text from the file. It might be corrupted or protected.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Unsupported File Type",
        description:
          "Please upload a .txt or .docx file.",
        variant: "destructive",
      });
    }

    if (event.target) {
        event.target.value = "";
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input is empty",
        description: "Please paste text or upload a file.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setHasGenerated(true);
    setSummary("");
    setKeyConcepts([]);
    setFlashcards([]);

    try {
      const content = inputText;
      const result = await generateStudyMaterials({ content });

      setSummary(result.summary);
      setKeyConcepts(result.keyConcepts);
      setFlashcards(result.flashcards);
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast({
        title: "An error occurred",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputText, toast]);
  
  const clearInput = () => {
    setInputText("");
  };

  const flashcardsForCopy = useMemo(() => {
    return flashcards
      .map((fc) => `Question: ${fc.question}\nAnswer: ${fc.answer}`)
      .join("\n\n");
  }, [flashcards]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-4 px-6 md:py-6 md:px-8 flex items-center justify-between border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-headline font-bold">StudyAI</h1>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="space-y-8">
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <Sparkles className="text-accent w-6 h-6" />
                  Create Study Materials
                </CardTitle>
                <CardDescription>
                  Paste text or upload a .txt or .docx file to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="paste" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">Paste Text</TabsTrigger>
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                  </TabsList>
                  <TabsContent value="paste" className="relative">
                     <Textarea
                        placeholder="Paste your lecture notes or textbook content here..."
                        className="min-h-[300px] mt-4 resize-y"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                      />
                      {inputText && (
                         <Button variant="ghost" size="icon" className="absolute top-5 right-1 h-8 w-8 rounded-full" onClick={clearInput}>
                           <X className="h-4 w-4" />
                         </Button>
                      )}
                  </TabsContent>
                  <TabsContent value="upload">
                    <div
                      className="mt-4 flex flex-col items-center justify-center p-10 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className="w-12 h-12 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        TXT and DOCX files supported
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,.docx"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !inputText}
                  className="w-full text-lg py-6 font-bold"
                >
                  {isLoading ? (
                    <LoaderCircle className="animate-spin mr-2" />
                  ) : null}
                  Generate
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-8">
            {isLoading ? (
              <ResultsSkeletons />
            ) : !hasGenerated ? (
              <Placeholder />
            ) : (
              <>
                {summary && (
                  <Card className="shadow-lg rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <FileText className="text-primary w-6 h-6" />
                        Summary
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(summary, "summary")}
                      >
                        {copiedStates.summary ? <Clipboard className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base leading-relaxed">{summary}</p>
                    </CardContent>
                  </Card>
                )}
                {keyConcepts.length > 0 && (
                  <Card className="shadow-lg rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Lightbulb className="text-primary w-6 h-6" />
                        Key Concepts
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(keyConcepts.join(", "), "concepts")}
                      >
                        {copiedStates.concepts ? <Clipboard className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {keyConcepts.map((concept, index) => (
                          <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {flashcards.length > 0 && (
                  <Card className="shadow-lg rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Layers3 className="text-primary w-6 h-6" />
                        Flashcards
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(flashcardsForCopy, "flashcards")}
                      >
                        {copiedStates.flashcards ? <Clipboard className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {flashcards.map((flashcard, index) => (
                          <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-left hover:no-underline">
                              {flashcard.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-base">
                              {flashcard.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const Placeholder = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-muted/30 rounded-xl border border-dashed p-8 text-center">
    <div className="p-5 bg-primary/20 rounded-full">
        <BrainCircuit className="w-16 h-16 text-primary" />
    </div>
    <h2 className="mt-6 text-2xl font-headline font-semibold">Your AI study partner is ready</h2>
    <p className="mt-2 text-muted-foreground max-w-sm">
        Provide some content on the left, and watch the magic happen here. Get summaries, key points, and flashcards in seconds.
    </p>
  </div>
);

const ResultsSkeletons = () => (
  <>
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <Skeleton className="h-8 w-56" />
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-36" />
      </CardContent>
    </Card>
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <Skeleton className="h-8 w-40" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
            <Skeleton className="h-5 w-3/4" />
        </div>
        <div className="flex justify-between items-center border-b pb-2">
            <Skeleton className="h-5 w-full" />
        </div>
        <div className="flex justify-between items-center border-b pb-2">
            <Skeleton className="h-5 w-4/5" />
        </div>
      </CardContent>
    </Card>
  </>
);
