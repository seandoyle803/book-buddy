import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, BookOpen, Check, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useBooks, useCreateBook, useSetCurrentBook } from "@/hooks/use-books";
import { getBookProgressPercent } from "@/lib/calculations";
import type { Book } from "@/hooks/use-books";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().optional(),
  totalPages: z.coerce.number().min(1, "Must be at least 1 page"),
  currentPage: z.coerce.number().min(0, "Cannot be negative"),
}).refine(data => data.currentPage <= data.totalPages, {
  message: "Current page cannot exceed total pages",
  path: ["currentPage"]
});

type BookFormValues = z.infer<typeof bookSchema>;

export default function Books() {
  const { data: books, isLoading } = useBooks();
  const createBook = useCreateBook();
  const setCurrentBook = useSetCurrentBook();
  
  const [isAddOpen, setIsAddOpen] = useState(false);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      totalPages: 300,
      currentPage: 0,
    },
  });

  const onSubmit = async (data: BookFormValues) => {
    try {
      await createBook.mutateAsync({
        title: data.title,
        author: data.author || null,
        total_pages: data.totalPages,
        current_page: data.currentPage,
        is_completed: data.currentPage >= data.totalPages,
        completed_at: data.currentPage >= data.totalPages ? new Date().toISOString() : null,
        last_read_at: null,
        is_current: !books?.some(b => b.is_current), // Make current if it's the first book
      });
      setIsAddOpen(false);
      form.reset();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetCurrent = async (id: string) => {
    await setCurrentBook.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 md:p-10 space-y-8 animate-pulse">
          <div className="h-10 bg-muted rounded w-1/4 mb-8"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-48 bg-muted rounded-xl"></div>
            <div className="h-48 bg-muted rounded-xl"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentBooks = books?.filter(b => !b.is_completed) || [];
  const completedBooks = books?.filter(b => b.is_completed) || [];

  return (
    <AppLayout>
      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
        <div className="flex justify-between items-end border-b border-border/50 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Your Library</h1>
            <p className="text-muted-foreground mt-2">Books you're reading and have finished.</p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-book">
                <Plus className="mr-2 h-4 w-4" /> Add Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-serif">Add a new book</DialogTitle>
                <DialogDescription>
                  Add a book to your library to start tracking your reading.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Book title" {...field} data-testid="input-book-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Author name" {...field} data-testid="input-book-author" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="totalPages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Pages</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} data-testid="input-total-pages" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currentPage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Page</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} data-testid="input-current-page" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={createBook.isPending} data-testid="button-submit-book">
                    {createBook.isPending ? "Adding..." : "Add Book"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Reading Now
            </h2>
            
            {currentBooks.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {currentBooks.map((book: Book) => (
                  <Card key={book.id} className={`overflow-hidden transition-all duration-300 ${book.is_current ? 'border-primary/50 shadow-sm bg-primary/5' : 'hover:border-primary/30'}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-serif text-xl font-semibold line-clamp-1">{book.title}</h3>
                          {book.author && <p className="text-muted-foreground">{book.author}</p>}
                        </div>
                        {book.is_current && (
                          <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                            Current
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{getBookProgressPercent(book.current_page, book.total_pages)}%</span>
                        </div>
                        <Progress value={getBookProgressPercent(book.current_page, book.total_pages)} className="h-2" />
                        <div className="text-xs text-muted-foreground text-right">
                          Page {book.current_page} of {book.total_pages}
                        </div>
                      </div>
                      
                      {!book.is_current && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleSetCurrent(book.id)}
                          disabled={setCurrentBook.isPending}
                          data-testid={`button-set-current-${book.id}`}
                        >
                          Set as Current Read
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 rounded-xl border border-dashed border-border/60 text-muted-foreground bg-card/50">
                <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>Time to add your first book.</p>
              </div>
            )}
          </section>

          {completedBooks.length > 0 && (
            <section>
              <h2 className="text-xl font-medium mb-6 flex items-center gap-2 text-muted-foreground">
                <Check className="h-5 w-5" />
                Finished
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {completedBooks.map((book: Book) => (
                  <Card key={book.id} className="bg-muted/30 border-transparent">
                    <CardContent className="p-6">
                      <h3 className="font-serif text-lg font-semibold line-clamp-1 opacity-80">{book.title}</h3>
                      {book.author && <p className="text-muted-foreground text-sm">{book.author}</p>}
                      <div className="mt-4 text-xs text-muted-foreground">
                        Finished {book.completed_at ? new Date(book.completed_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'unknown date'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
