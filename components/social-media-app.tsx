"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Home,
  MessageCircle,
  Search as SearchIcon,
  User,
  Menu,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  Compass,
  Settings,
  LogOut,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Simulated data
interface Comment {
  id: number;
  username: string;
  content: string;
}

interface Post {
  id: number;
  username: string;
  content: string;
  image: string | null;
  likes: number;
  comments: Comment[];
  reactions: Record<string, number>;
}

const initialPosts: Post[] = [
  {
    id: 1,
    username: "jamescasipong",
    content: "Just had an amazing day at the beach! 🏖️ #SummerVibes",
    image: null,
    likes: 15,
    comments: [],
    reactions: {},
  },
  {
    id: 2,
    username: "lightyagami",
    content:
      "Just finished reading an amazing book! Any recommendations for what to read next? 📚",
    image: null,
    likes: 8,
    comments: [
      {
        id: 1,
        username: "BookWorm",
        content: 'I highly recommend "The Midnight Library" by Matt Haig!',
      },
    ],
    reactions: {},
  },
];

const exploreItems = [
  {
    id: 1,
    title: "Technology Trends",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    title: "Travel Destinations",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    title: "Healthy Recipes",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 4,
    title: "Fitness Tips",
    image: "/placeholder.svg?height=100&width=100",
  },
];

const emojiReactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export default function SocialMediaApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPost, setNewPost] = useState<string>("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<
    { id: number; content: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Post[]>([]);

  const toggleSidebar = () => setIsSidebarOpen(true);

  const handleNewPost = () => {
    if (newPost.trim() || newPostImage) {
      const post = {
        id: posts.length + 1,
        username: "CurrentUser",
        content: newPost,
        image: newPostImage,
        likes: 0,
        comments: [],
        reactions: {},
      };
      setPosts([post, ...posts]);
      setNewPost("");
      setNewPostImage(null);
      // Simulate notification
      setTimeout(() => {
        setNotifications([
          { id: Date.now(), content: "Your post was published successfully!" },
          ...notifications,
        ]);
      }, 1000);
    }
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setNewPostImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReaction = (postId: number, emoji: "string") => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactions: {
                ...post.reactions,
                [emoji]: (post.reactions[emoji] || 0) + 1,
              },
            }
          : post
      )
    );
  };

  const handleComment = (postId: number, comment: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: post.comments.length + 1,
                  username: "CurrentUser",
                  content: comment,
                },
              ],
            }
          : post
      )
    );
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      const results = posts.filter(
        (post) =>
          post.content.toLowerCase().includes(term.toLowerCase()) ||
          post.username.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log("User logged out");
  };

  useEffect(() => {
    // Simulate new notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setNotifications((prev) => [
          {
            id: Date.now(),
            content: `New activity on your post!`,
          },
          ...prev,
        ]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className=" w-full overflow-auto bg-gray-100 dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full flex justify-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="#">
              <span className="hidden font-bold sm:inline-block">
                SocialApp
              </span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a
                className="transition-colors hover:text-foreground/80 text-foreground"
                href="#"
                onClick={() => setActiveTab("home")}
              >
                Home
              </a>
              <a
                className="transition-colors hover:text-foreground/80 text-muted-foreground"
                href="#"
                onClick={() => setActiveTab("explore")}
              >
                Explore
              </a>
              <a
                className="transition-colors hover:text-foreground/80 text-muted-foreground"
                href="#"
                onClick={() => setActiveTab("messages")}
              >
                Messages
              </a>
            </nav>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="mr-2 md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="w-full md:w-[300px] pl-8"
                  placeholder="Search..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <nav className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px]">
                  {notifications.length === 0 ? (
                    <DropdownMenuItem>No new notifications</DropdownMenuItem>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem key={notification.id}>
                        {notification.content}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar>
                      <AvatarImage
                        src="/placeholder-avatar.jpg"
                        alt="@username"
                      />
                      <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>
      </header>
      <div className="w-full flex justify-center">
        <div className="w-[1550px] items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <aside
            className={`fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-x shadow-sm md:sticky md:block ${
              isSidebarOpen ? "block" : ""
            }`}
          >
            <div className="py-6 pr-6 lg:py-8">
              <nav className="flex flex-col space-y-2 ml-5">
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => setActiveTab("home")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => setActiveTab("messages")}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Messages
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => setActiveTab("explore")}
                >
                  <Compass className="mr-2 h-4 w-4" />
                  Explore
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </nav>
            </div>
          </aside>
          <main className="flex justify-center flex-col overflow-hidden">
            <Tabs value={activeTab} className="w-full">
              <TabsContent
                value="home"
                className="border-none p-0 outline-none"
              >
                <div className="flex flex-col space-y-4">
                  <Card>
                    <CardContent className="pt-4">
                      <Textarea
                        placeholder="What's on your mind?"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                      />
                      <div className="mt-2 flex justify-between items-center">
                        <div>
                          <input
                            type="file"
                            id="image-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer"
                          >
                            <Button variant="outline" size="sm">
                              <ImageIcon className="mr-2 h-4 w-4" />
                              Add Image
                            </Button>
                          </label>
                          {newPostImage && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              Image added
                            </span>
                          )}
                        </div>
                        <Button onClick={handleNewPost}>Post</Button>
                      </div>
                    </CardContent>
                  </Card>
                  {searchTerm ? (
                    searchResults.length > 0 ? (
                      searchResults.map((post) => (
                        <Card key={post.id}>
                          <CardHeader>
                            <div className="flex items-start space-x-4">
                              <Avatar>
                                <AvatarImage src="/placeholder-avatar.jpg" />
                                <AvatarFallback>
                                  {post.username.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  {post.username}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  2 hours ago
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p>{post.content}</p>
                            {post.image && (
                              <img
                                src={post.image}
                                alt="Post image"
                                className="mt-2 rounded-md max-h-96 w-full object-cover"
                              />
                            )}
                          </CardContent>
                          <CardFooter className="flex flex-col items-start space-y-4">
                            <div className="flex w-full  justify-between">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <ThumbsUp className="mr-2 h-4 w-4" />(
                                    {Object.values(post.reactions).reduce(
                                      (a, b) => a + b,
                                      0
                                    ) + post.likes}
                                    )
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="flex p-0">
                                  {emojiReactions.map((emoji: any) => (
                                    <Button
                                      key={emoji}
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleReaction(post.id, emoji)
                                      }
                                    >
                                      {emoji}
                                    </Button>
                                  ))}
                                </PopoverContent>
                              </Popover>
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="mr-2 h-4 w-4" />(
                                {post.comments.length})
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="mr-2 h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(post.reactions).map(
                                ([emoji, count]) => (
                                  <span key={emoji} className="text-sm">
                                    {emoji} {count}
                                  </span>
                                )
                              )}
                            </div>
                            <div className="w-full space-y-2">
                              {post.comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="flex items-start space-x-2"
                                >
                                  <Avatar>
                                    <AvatarImage src="/placeholder-avatar.jpg" />
                                    <AvatarFallback>
                                      {comment.username.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                      {comment.username}
                                    </p>
                                    <p className="text-sm">{comment.content}</p>
                                  </div>
                                </div>
                              ))}
                              <div className="flex items-center space-x-2">
                                <Avatar>
                                  <AvatarImage src="/placeholder-avatar.jpg" />
                                  <AvatarFallback>UN</AvatarFallback>
                                </Avatar>
                                <Input
                                  placeholder="Write a comment..."
                                  className="min-w-[200px] flex-1"
                                  onKeyPress={(e: any) => {
                                    if (e.key === "Enter") {
                                      handleComment(post.id, e.target.value);
                                      e.target.value = "";
                                    }
                                  }}
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    const input = e.currentTarget
                                      .previousElementSibling as HTMLInputElement;
                                    if (input.value.trim()) {
                                      handleComment(post.id, input.value);
                                      input.value = "";
                                    }
                                  }}
                                >
                                  <Send className="h-4 w-4" />
                                  <span className="sr-only">Send comment</span>
                                </Button>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent>
                          <p className="text-center py-4">
                            No results found for "{searchTerm}"
                          </p>
                        </CardContent>
                      </Card>
                    )
                  ) : (
                    posts.map((post) => (
                      <Card key={post.id}>
                        <CardHeader>
                          <div className="flex items-start space-x-4">
                            <Avatar>
                              <AvatarImage src="/placeholder-avatar.jpg" />
                              <AvatarFallback>
                                {post.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {post.username}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                2 hours ago
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p>{post.content}</p>
                          {post.image && (
                            <img
                              src={post.image}
                              alt="Post image"
                              className="mt-2 rounded-md max-h-96 w-full object-cover"
                            />
                          )}
                        </CardContent>
                        <CardFooter className="flex flex-col items-start space-y-4">
                          <div className="flex w-full justify-between">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ThumbsUp className="mr-2 h-4 w-4" />(
                                  {Object.values(post.reactions).reduce(
                                    (a, b) => a + b,
                                    0
                                  ) + post.likes}
                                  )
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="flex p-0">
                                {emojiReactions.map((emoji: any) => (
                                  <Button
                                    key={emoji}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleReaction(post.id, emoji)
                                    }
                                  >
                                    {emoji}
                                  </Button>
                                ))}
                              </PopoverContent>
                            </Popover>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="mr-2 h-4 w-4" />(
                              {post.comments.length})
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="mr-2 h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(post.reactions).map(
                              ([emoji, count]) => (
                                <span key={emoji} className="text-sm">
                                  {emoji} {count}
                                </span>
                              )
                            )}
                          </div>
                          <div className="w-full space-y-2">
                            {post.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="flex items-start space-x-2"
                              >
                                <Avatar>
                                  <AvatarImage src="/placeholder-avatar.jpg" />
                                  <AvatarFallback>
                                    {comment.username.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium leading-none">
                                    {comment.username}
                                  </p>
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                            <div className="flex items-center space-x-2">
                              <Avatar>
                                <AvatarImage src="/placeholder-avatar.jpg" />
                                <AvatarFallback>UN</AvatarFallback>
                              </Avatar>
                              <Input
                                placeholder="Write a comment..."
                                className="flex-1"
                                onKeyPress={(e: any) => {
                                  if (e.key === "Enter") {
                                    handleComment(post.id, e.target.value);
                                    e.target.value = "";
                                  }
                                }}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  const input = e.currentTarget
                                    .previousElementSibling as HTMLInputElement;
                                  if (input.value.trim()) {
                                    handleComment(post.id, input.value);
                                    input.value = "";
                                  }
                                }}
                              >
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send comment</span>
                              </Button>
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
              <TabsContent
                value="profile"
                className="border-none p-0 outline-none"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold">James Casipong</h2>
                        <p className="text-muted-foreground">@jamescasipong</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Bio</h3>
                        <p>
                          Passionate about technology, travel, and good food.
                          Always learning, always growing.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold">Location</h3>
                        <p>Quezon City, Philippines</p>
                      </div>
                      <div>
                        <h3 className="font-semibold">Joined</h3>
                        <p>Oct 2024</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="mt-6">
                  <h3 className="font-semibold mb-4">Your Posts</h3>
                  <div className="space-y-4">
                    {posts
                      .filter((post) => post.username === "CurrentUser")
                      .map((post) => (
                        <Card key={post.id}>
                          <CardContent className="pt-4">
                            <p>{post.content}</p>
                            {post.image && (
                              <img
                                src={post.image}
                                alt="Post image"
                                className="mt-2 rounded-md max-h-96 w-full object-cover"
                              />
                            )}
                          </CardContent>
                          <CardFooter>
                            <p className="text-sm text-muted-foreground">
                              Posted recently
                            </p>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent
                value="explore"
                className="border-none p-0 outline-none"
              >
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {exploreItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-40 object-cover rounded-md mb-2"
                        />
                        <h3 className="font-semibold">{item.title}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent
                value="messages"
                className="border-none p-0 outline-none"
              >
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold">Messages</h2>
                  </CardHeader>
                  <CardContent>
                    <p>Your messages will appear here. Start a conversation!</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent
                value="settings"
                className="border-none p-0 outline-none"
              >
                <Card>
                  <CardHeader>
                    <h2 className="text-2xl font-bold">Settings</h2>
                  </CardHeader>
                  <CardContent>
                    <p>Manage your account settings and preferences here.</p>
                    {/* Add more settings options here */}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}
