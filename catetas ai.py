import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, font, Menu
from google import genai
import os

class GeminiAIGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Catetas AI")
        self.root.geometry("900x700")
        self.root.configure(bg="#2c3e50")
        self.root.resizable(True, True)

        self.client = genai.Client(api_key="AIzaSyAXI-yLqe4jfGv-abhQBNGDVOAXTEHThIY")

        # Define fonts
        self.title_font = font.Font(family="Arial", size=24, weight="bold")
        self.label_font = font.Font(family="Arial", size=12)
        self.text_font = font.Font(family="Consolas", size=11)

        # Add menu bar
        self.menu_bar = Menu(self.root)
        self.root.config(menu=self.menu_bar)

        # File menu
        file_menu = Menu(self.menu_bar, tearoff=0)
        file_menu.add_command(label="Clear Conversation", command=self.clear_conversation)
        file_menu.add_command(label="Exit", command=self.root.quit)
        self.menu_bar.add_cascade(label="File", menu=file_menu)

        # Help menu
        help_menu = Menu(self.menu_bar, tearoff=0)
        help_menu.add_command(label="About", command=self.show_about)
        self.menu_bar.add_cascade(label="Help", menu=help_menu)

        # Title label
        self.title_label = tk.Label(root, text="Catetas AI", bg="#2c3e50", fg="white", font=self.title_font)
        self.title_label.pack(pady=(10, 20))

        # Main frame
        self.main_frame = ttk.Frame(root, padding=10)
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        # Input frame
        self.input_frame = ttk.LabelFrame(self.main_frame, text="Input", padding=10)
        self.input_frame.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)

        # Input label
        self.label = ttk.Label(self.input_frame, text="Enter your prompt:", font=self.label_font)
        self.label.grid(row=0, column=0, sticky="w", padx=5, pady=(5, 0))

        # Input text box
        self.prompt_entry = tk.Text(self.input_frame, height=5, font=self.text_font, wrap=tk.WORD)
        self.prompt_entry.grid(row=1, column=0, columnspan=2, padx=5, pady=5, sticky="we")
        self.prompt_entry.bind("<Return>", self.on_enter_pressed)

        # Buttons frame
        self.buttons_frame = ttk.Frame(self.input_frame)
        self.buttons_frame.grid(row=2, column=0, columnspan=2, sticky="we", padx=5, pady=(10, 0))

        # Generate button
        self.generate_button = ttk.Button(self.buttons_frame, text="Generate", command=self.generate_content)
        self.generate_button.pack(side=tk.RIGHT, padx=(0, 10))

        # Clear conversation button
        self.clear_button = ttk.Button(self.buttons_frame, text="Clear", command=self.clear_conversation)
        self.clear_button.pack(side=tk.RIGHT)

        # History frame
        self.history_frame = ttk.LabelFrame(self.main_frame, text="Conversation History", padding=10)
        self.history_frame.grid(row=1, column=0, sticky="nsew", padx=10, pady=10)

        # Conversation history text area
        self.history_text = scrolledtext.ScrolledText(self.history_frame, height=15, font=self.text_font, state='disabled', wrap=tk.WORD)
        self.history_text.pack(fill=tk.BOTH, expand=True)

        # Configure grid weights
        self.main_frame.rowconfigure(1, weight=1)
        self.main_frame.columnconfigure(0, weight=1)

        # Load conversation log if exists
        self.log_file = "conversation_log.txt"
        self.load_conversation_log()

    def on_enter_pressed(self, event):
        if event.state & 0x0001:  # Shift key pressed
            self.prompt_entry.insert(tk.INSERT, "\n")
            return "break"
        else:
            self.generate_content()
            return "break"

    def generate_content(self):
        prompt = self.prompt_entry.get("1.0", tk.END).strip()
        if not prompt:
            messagebox.showwarning("Input Error", "Please enter a prompt.")
            return
        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            self.history_text.config(state='normal')
            self.history_text.insert(tk.END, f"User: {prompt}\n")
            self.history_text.insert(tk.END, f"AI: {response.text}\n\n")
            self.history_text.see(tk.END)
            self.history_text.config(state='disabled')

            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(f"User: {prompt}\n")
                f.write(f"AI: {response.text}\n\n")

            self.prompt_entry.delete("1.0", tk.END)
        except Exception as e:
            messagebox.showerror("API Error", f"An error occurred: {e}")

    def load_conversation_log(self):
        if os.path.exists(self.log_file):
            with open(self.log_file, "r", encoding="utf-8") as f:
                content = f.read()
            self.history_text.config(state='normal')
            self.history_text.insert(tk.END, content)
            self.history_text.see(tk.END)
            self.history_text.config(state='disabled')

    def clear_conversation(self):
        self.history_text.config(state='normal')
        self.history_text.delete("1.0", tk.END)
        self.history_text.config(state='disabled')
        if os.path.exists(self.log_file):
            os.remove(self.log_file)

    def show_about(self):
        messagebox.showinfo("About", "Catetas AI\nVersion 1.0\nPowered by Gemini AI")

if __name__ == "__main__":
    root = tk.Tk()
    app = GeminiAIGUI(root)
    root.mainloop()