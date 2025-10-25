import axios, { type AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5020/api";

console.log("API_BASE_URL:", API_BASE_URL);
console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post("/auth/login", { email, password });
    return response.data;
  }

  async signup(
    email: string,
    password: string,
    name: string,
    role: string,
    additionalFields?: {
      firstName?: string;
      lastName?: string;
      mobileNumber?: string;
      grade10?: number;
      grade12?: number;
      courseName?: string;
      courseStartDate?: string;
    }
  ) {
    // Use provided fields or split name into firstName and lastName
    const firstName =
      additionalFields?.firstName || name.trim().split(" ")[0] || "";
    const lastName =
      additionalFields?.lastName ||
      name.trim().split(" ").slice(1).join(" ") ||
      "";

    const response = await this.client.post("/auth/register", {
      firstName,
      lastName,
      email,
      password,
      role,
      mobileNumber: additionalFields?.mobileNumber || "1234567890",
      grade10: additionalFields?.grade10 || 75,
      grade12: additionalFields?.grade12 || 75,
      courseName: additionalFields?.courseName || "Bachelor of Technology",
      courseStartDate:
        additionalFields?.courseStartDate || new Date().toISOString(),
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get("/auth/me");
    return response.data;
  }

  // Job endpoints
  async getJobs() {
    const response = await this.client.get("/jobs");
    return response.data;
  }

  async getJobById(id: string) {
    const response = await this.client.get(`/jobs/${id}`);
    return response.data;
  }

  async createJob(job: any) {
    const response = await this.client.post("/jobs", job);
    return response.data;
  }

  async applyForJob(jobId: string, resume?: string) {
    const response = await this.client.post(`/jobs/${jobId}/apply`, { resume });
    return response.data;
  }

  // Application endpoints (for viewing applications by admin)
  async getApplications() {
    const response = await this.client.get("/applications");
    return response.data;
  }

  // Task endpoints
  async getTasks() {
    const response = await this.client.get("/tasks");
    return response.data;
  }

  async createTask(task: any) {
    const response = await this.client.post("/tasks", task);
    return response.data;
  }

  async updateTask(id: string, task: any) {
    const response = await this.client.put(`/tasks/${id}`, task);
    return response.data;
  }

  async applyForTask(taskId: string) {
    const response = await this.client.post(`/tasks/${taskId}/apply`);
    return response.data;
  }

  // Chat endpoints
  async getConversations(params?: {
    page?: number;
    limit?: number;
    type?: string;
    archived?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.type) queryParams.append("type", params.type);
    if (params?.archived !== undefined)
      queryParams.append("archived", params.archived.toString());

    const response = await this.client.get(
      `/chat/conversations?${queryParams.toString()}`
    );
    return response.data;
  }

  async getMessages(
    conversationId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      type?: string;
      before?: string;
    }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.before) queryParams.append("before", params.before);

    const response = await this.client.get(
      `/chat/messages/${conversationId}?${queryParams.toString()}`
    );
    return response.data;
  }

  async sendMessage(
    conversationId: string,
    content: string,
    type: string = "text",
    replyTo?: string,
    attachments?: any[]
  ) {
    const response = await this.client.post(`/chat/messages`, {
      conversationId,
      text: content,
      type,
      replyTo,
      attachments,
    });
    return response.data;
  }

  async startConversation(
    recipientId: string,
    type: string = "direct",
    jobId?: string,
    taskId?: string
  ) {
    const response = await this.client.post(
      `/chat/conversations/${recipientId}`,
      { type, jobId, taskId }
    );
    return response.data;
  }

  async editMessage(messageId: string, text: string) {
    const response = await this.client.put(`/chat/messages/${messageId}`, {
      text,
    });
    return response.data;
  }

  async deleteMessage(messageId: string) {
    const response = await this.client.delete(`/chat/messages/${messageId}`);
    return response.data;
  }

  async archiveConversation(conversationId: string, archived: boolean) {
    const response = await this.client.put(
      `/chat/conversations/${conversationId}/archive`,
      { archived }
    );
    return response.data;
  }

  async markConversationAsRead(conversationId: string) {
    const response = await this.client.put(
      `/chat/conversations/${conversationId}/read`
    );
    return response.data;
  }

  async searchMessages(
    query: string,
    conversationId?: string,
    page?: number,
    limit?: number
  ) {
    const queryParams = new URLSearchParams();
    queryParams.append("q", query);
    if (conversationId) queryParams.append("conversationId", conversationId);
    if (page) queryParams.append("page", page.toString());
    if (limit) queryParams.append("limit", limit.toString());

    const response = await this.client.get(
      `/chat/search?${queryParams.toString()}`
    );
    return response.data;
  }

  async uploadFiles(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await this.client.post("/upload/chat", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // User management (admin)
  async getUsers() {
    console.log("API Client: Making request to /chat/users");
    console.log("API Client: Base URL:", this.client.defaults.baseURL);
    const response = await this.client.get("/chat/users");
    return response.data;
  }

  async updateUser(id: string, user: any) {
    const response = await this.client.put(`/admin/users/${id}`, user);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.client.delete(`/admin/users/${id}`);
    return response.data;
  }

  async approveUser(id: string) {
    const response = await this.client.put(`/admin/approve-alumni/${id}`);
    return response.data;
  }
}

export const apiClient = new APIClient();
