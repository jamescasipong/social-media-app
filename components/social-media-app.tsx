"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Compass,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  Search as SearchIcon,
  Send,
  Settings,
  Share2,
  ThumbsUp,
  Upload,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "../app/contexts/AuthContext";

type User = {
  _id: string;
  username: string;
  email: string;
  avatar: string;
};

interface Comment {
  id: string;
  createdAt: Date;
  username: string;
  content: string;
}

interface Post {
  _id: string;
  userId: User;
  content: string;
  image?: string;
  createdAt: Date;
  comments: Comment[];
  reactions: Record<string, string[]>;
}

interface ExploreItem {
  id: string;
  title: string;
  image: string;
}

type Notification = {
  id: string;
  content: string;
  createdAt: Date;
};

const emojiReactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export default function SocialMediaApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [exploreItems, setExploreItems] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>(
    {}
  );
  const [postCount, setPostCount] = useState(0);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleCommentChange = (postId: string, text: string) => {
    setCommentTexts((prev) => ({
      ...prev,
      [postId]: text,
    }));
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "https://socmedia-api.vercel.app/api/auth/posts"
        );
        if (response.ok) {
          const postsData = await response.json();
          setPostCount(postsData.length);
        } else {
          throw new Error("Failed to fetch posts");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPosts();
  }, []);

  const handleNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to create a post");
      router.push("/login");
    }
    try {
      const response = await fetch(
        "https://socmedia-api.vercel.app/api/auth/posts",
        {
          method: "POST",
          body: JSON.stringify({
            content: newPost,
            image: newPostImage || "https://via.placeholder.com/300",
            createdAt: new Date().toISOString(),
            comments: [],
            reactions: {
              "👍": [],
              "❤️": [],
              "😂": [],
              "😮": [],
              "😢": [],
              "😡": [],
            },
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      setNewPost("");
      setNewPostImage(null);
      await getAllPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const getAllPosts = async () => {
    try {
      const response = await fetch(
        "https://socmedia-api.vercel.app/api/auth/posts"
      );
      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);
      } else {
        throw new Error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getAllPosts();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleComment = async (postId: string) => {
    if (!user) {
      alert("You must be logged in to create a post");
      router.push("/login");
    }

    try {
      const updatedPosts = posts.map((post) =>
        post._id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: Date.now().toString(),
                  createdAt: new Date(),
                  username: user?.username || "Anonymous",
                  content: commentTexts[postId],
                },
              ],
            }
          : post
      );
      setPosts(updatedPosts);

      setCommentTexts((prev) => ({
        ...prev,
        [postId]: "",
      }));

      const response = await fetch(
        `https://socmedia-api.vercel.app/api/auth/comments/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            content: commentTexts[postId],
            username: user?.username,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  useEffect(() => {
    setCurrentUser(user);

    if (user && pathname === "/login") {
      router.push("/");
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReaction = (postId: string, emoji: string) => {
    if (!user) {
      alert("You must be logged in to react to a post");
      router.push("/login");
    }

    setPosts(
      posts.map((post) => {
        if (post._id === postId) {
          const updatedReactions = { ...post.reactions };
          // Remove current user's reactions
          Object.keys(updatedReactions).forEach((key) => {
            updatedReactions[key] = updatedReactions[key].filter(
              (userId) => userId !== currentUser?._id
            );
          });
          // Add the reaction
          if (!updatedReactions[emoji]) {
            updatedReactions[emoji] = [];
          }
          if (currentUser?._id) {
            updatedReactions[emoji].push(currentUser._id);
          }

          fetch(
            `https://socmedia-api.vercel.app/api/auth/reactions/${postId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              body: JSON.stringify({
                reactions: updatedReactions,
              }),
            }
          );

          return { ...post, reactions: updatedReactions };
        }
        return post;
      })
    );
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      const results = posts.filter(
        (post) =>
          post.content.toLowerCase().includes(term.toLowerCase()) ||
          post.userId.username.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setNotifications((prev) => [
          {
            id: Date.now().toString(),
            content: `New activity on your post!`,
            createdAt: new Date(),
          },
          ...prev,
        ]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const PostSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex items-start space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-48 w-full mt-2" />
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <div className="flex w-full justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="w-full space-y-4">
          <div className="flex items-start space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-[100px]" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center">
      <header className="sticky justify-center flex top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                        src={currentUser?.avatar}
                        alt={currentUser?.username}
                      />
                      <AvatarFallback>
                        {currentUser?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
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
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside
          className={`fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block ${
            isSidebarOpen ? "block" : ""
          }`}
        >
          <div className="py-6 pr-6 lg:py-8">
            <nav className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setActiveTab("home")}
              >
                <Home className="mr-2 h-4  w-4" />
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
        <main className="flex w-full flex-col overflow-hidden">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="home" className="border-none p-0 outline-none">
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
                            <Upload className="mr-2 h-4 w-4" />
                            {newPostImage ? "Change Image" : "Add Image"}
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
                {loading ? (
                  <>
                    {[...Array(postCount)].map((_, index) => (
                      <PostSkeleton key={index} />
                    ))}
                  </>
                ) : (
                  (searchTerm ? searchResults : posts).map((post) => (
                    <Card key={post._id}>
                      <CardHeader>
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarImage src="/placeholder-avatar.jpg" />
                            <AvatarFallback>
                              {post.userId.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-bold leading-none">
                              {post.userId.username}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(post.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p>{post.content}</p>
                        {post.image !== "https://via.placeholder.com/300" && (
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
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                React (
                                {Object.values(post.reactions).flat().length})
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="flex p-0">
                              {emojiReactions.map((emoji) => (
                                <Button
                                  key={emoji}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    handleReaction(post._id, emoji);
                                    document.body.click(); // Close the popover
                                  }}
                                >
                                  {emoji}
                                </Button>
                              ))}
                            </PopoverContent>
                          </Popover>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Comment ({post.comments.length})
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(post.reactions).map(
                            ([emoji, users]) =>
                              users.length > 0 && (
                                <span key={emoji} className="text-sm">
                                  {emoji} {users.length}
                                </span>
                              )
                          )}
                        </div>
                        <div className="w-full space-y-5">
                          {post.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="flex items-start space-x-2"
                            >
                              <Avatar>
                                <AvatarImage src="/placeholder-avatar.jpg" />
                                <AvatarFallback>
                                  {comment.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2 gap-5">
                                <p className="text-sm font-bold leading-none">
                                  {comment.username}
                                </p>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center space-x-2">
                            <Avatar>
                              <AvatarImage src={currentUser?.avatar} />
                              <AvatarFallback>
                                {currentUser?.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <Input
                              placeholder="Write a comment..."
                              className="flex-1"
                              value={commentTexts[post._id] || ""}
                              onChange={(e) =>
                                handleCommentChange(post._id, e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleComment(post._id);
                                }
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleComment(post._id)}
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
                      <AvatarImage src={currentUser?.avatar} />
                      <AvatarFallback>
                        {currentUser?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {currentUser?.username}
                      </h2>
                      <p className="text-muted-foreground">
                        @{currentUser?.username.toLowerCase()}
                      </p>
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
                      <p>San Francisco, CA</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Joined</h3>
                      <p>January 2020</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Your Posts</h3>
                <div className="space-y-4">
                  {posts
                    .filter(
                      (post) => post.userId.username === currentUser?.username
                    )
                    .map((post) => (
                      <Card key={post._id}>
                        <CardContent className="pt-4">
                          <p>{post.content}</p>
                          {post.image &&
                            post.image !==
                              "https://via.placeholder.com/300" && (
                              <img
                                src={post.image}
                                alt="Post image"
                                className="mt-2 rounded-md max-h-96 w-full object-cover"
                              />
                            )}
                        </CardContent>
                        <CardFooter>
                          <p className="text-sm text-muted-foreground">
                            Posted on{" "}
                            {new Date(post.createdAt).toLocaleString()}
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
  );
}
