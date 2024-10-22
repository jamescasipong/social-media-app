"use client";
import React, { useState, useEffect } from "react";
import {
  Bell,
  Home,
  MessageCircle,
  Search as SearchIcon,
  User,
  Menu,
  X,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  Compass,
  Settings,
  LogOut,
  Image as ImageIcon,
  Smile,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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

type User = {
  id: string;
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
  userId: User; // This assumes userId contains user info
  content: string;
  image?: string; // Optional if no image is present
  createdAt: Date; // Use string if it's a date string from API
  comments: Comment[];
  reactions: Record<string, string[]>; // Record of emoji reactions
}

interface ExploreItem {
  id: string;
  title: string;
  image: string;
  // Add any other explore item fields here
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
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>(
    {}
  );
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleNewComment = async (e: any) => {
    e.preventDefault();

    setNewComment(e.target.value);
  };

  const handleCommentChange = (postId: string, text: string) => {
    setCommentTexts((prev) => ({
      ...prev,
      [postId]: text,
    }));
  };

  const handleNewPost = async (e: any) => {
    e.preventDefault();

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
            "Content-Type": "application/json", // Ensure correct content type
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      console.log("response", response);

      if (!response.ok) {
        const errorData = await response.json(); // Get error details
        throw new Error(errorData.message || "Failed to create post");
      }

      setNewPostContent(""); // Clear content input
      setNewPostImage(null); // Clear image input
      setNewPost(""); // Clear post input
      // Fetch all posts after successful creation
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

        console.log("postsData", postsData);
      } else {
        throw new Error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    const interval = setInterval(() => {
      getAllPosts();
    }, 2000);
    setLoading(false);
    return () => clearInterval(interval);
  }, []);

  const handleComment = async (postId: string) => {
    try {
      const response = await fetch(
        `https://socmedia-api.vercel.app/auth/comments/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // If you use token-based auth
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

      const comment: Comment = await response.json();

      // Update the post's comments in state
      setPosts((prevPosts) => {
        return prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, comment] }
            : post
        );
      });

      getAllPosts();

      setCommentTexts((prev) => ({
        ...prev,
        [postId]: "",
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  useEffect(() => {
    setCurrentUser(user);
    console.log("user", user);
    if (!user) {
      router.push("/login");
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
    setPosts(
      posts.map((post) => {
        if (post._id === postId) {
          const updatedReactions = { ...post.reactions };
          if (currentUser) {
            // Remove user from all other reactions
            Object.keys(updatedReactions).forEach((key) => {
              updatedReactions[key] = updatedReactions[key].filter(
                (userId) => userId !== currentUser.id
              );
            });
            // Add user to the selected reaction
            if (!updatedReactions[emoji]) {
              updatedReactions[emoji] = [];
            }
            if (!updatedReactions[emoji].includes(currentUser.id)) {
              updatedReactions[emoji].push(currentUser.id);
            } else {
              // If user already reacted with this emoji, remove the reaction
              updatedReactions[emoji] = updatedReactions[emoji].filter(
                (userId) => userId !== currentUser.id
              );
            }
          }
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
    // Simulate new notifications
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

  if (!currentUser) {
    return <div>Please log in to view the app.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen   bg-gray-100 dark:bg-gray-900 flex flex-col items-center">
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
                        src={currentUser.avatar}
                        alt={currentUser.username}
                      />
                      <AvatarFallback>
                        {currentUser.username.charAt(0).toLocaleUpperCase()}
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
                {(searchTerm ? searchResults : posts).map((post) => (
                  <Card key={post._id}>
                    <CardHeader>
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback>
                            {post.userId.username.charAt(0).toLocaleUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-bold leading-none">
                            {post.userId.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {post.createdAt.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>{post.content}</p>
                      {post.image != "https://via.placeholder.com/300" && (
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
                                {comment.username
                                  ?.charAt(0)
                                  .toLocaleUpperCase()}
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
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback>
                              {currentUser.username
                                .charAt(0)
                                .toLocaleUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Input
                            placeholder="Write a comment..."
                            className="flex-1"
                            value={commentTexts[post._id] || ""}
                            onChange={(e) =>
                              handleCommentChange(post._id, e.target.value)
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleComment(post._id);
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
                                handleComment(post._id);
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
                ))}
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
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback>
                        {currentUser.username.charAt(0).toLocaleUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {currentUser.username}
                      </h2>
                      <p className="text-muted-foreground">
                        @{currentUser.username}
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
                      (post) => post.userId.username === currentUser.username
                    )
                    .map((post) => (
                      <Card key={post._id}>
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
                            Posted on {post.createdAt.toLocaleString()}
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
