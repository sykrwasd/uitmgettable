# uitmgettable

🕒 **An open-source UiTM Timetable Generator — built for students, by students 🎓**

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

## 📖 About

**uitmgettable** is a modern, fast, and open-source tool designed to help UiTM students generate their class timetables effortlessly. It scrapes data directly from UiTM's official sources to ensure accuracy and provides a user-friendly interface to organize your semester.

## ✨ Features

*   **🔍 Smart Search**: Easily find your campus and subjects.
*   **📅 Timetable Generation**: Automatically generate a visual timetable based on your selected courses.
*   **💾 Export Options**: Download your timetable as an Image or PDF.
*   **🎨 Modern UI**: Built with **DaisyUI** and **TailwindCSS** for a clean, responsive experience.
*   **⚡ Fast & Reliable**: Powered by **Next.js** and **Cheerio** for efficient data fetching.
*   **📱 Responsive**: Works great on desktop and mobile devices.

## 🔄 Project Flow

The application operates in two distinct modes: **Manual** and **Auto-Fetch**.

### 1. Manual Mode
*Used when the user wants to manually build their timetable.*
*   **Selection:** Users select **Campus**, **Faculty**, and **Subject** via dropdowns.
*   **Data Fetching:** Hooks (`useCampus`, `useFaculty`, `useSubjects`) fetch options dynamically.
*   **Class Selection:** `useGroups` fetches available classes. Users click to add them to their `selectedClasses` state.
*   **Display:** The `Timetable` component renders the grid and handles image export.

### 2. Auto-Fetch Mode
*Used when the user enters their Matric Number to get registered courses automatically.*
*   **Input:** User enters Matric Number.
*   **Fetching:** `useTimetable` calls the API (`getTimetable`) and uses `parseTime.ts` to normalize the data.
*   **Display:** `FetchTimetable` renders the read-only grid.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [TailwindCSS](https://tailwindcss.com/) & [DaisyUI](https://daisyui.com/)
*   **Scraping**: [Cheerio](https://cheerio.js.org/) & [Axios](https://axios-http.com/)
*   **Utilities**:
    *   `html2canvas` & `jspdf` for exporting timetables.
    *   `tough-cookie` for session management.
    *   `react-select` for dropdowns.
    *   `lucide-react` & `react-icons` for iconography.

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

*   **Node.js** >= 18
*   **npm** or **yarn**

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/sykrwasd/uitmgettable.git
    cd uitmgettable
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

4.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) to see the app in action.

## 📂 Project Structure

```
uitmgettable/
├── src/
│   ├── app/             # Next.js App Router pages and API routes
│   ├── components/      # Reusable UI components (Timetable, Selectors, etc.)
│   ├── lib/             # Utility functions and shared logic
│   └── utils/           # Helper scripts
├── testScripts/         # Standalone scripts for testing scraping logic
├── public/              # Static assets
└── ...config files
```

## 🤝 Contributing

We ❤️ contributions!
Fork the repository, improve the code, and submit a pull request 🙌
Let’s make UiTM life easier together 🧠

### Commit Message Guidelines

We use an emoji-based commit convention to keep things fun and clear 🧩

**Format:** `<emoji> <short description>`

**Examples:**
*   ✨ Add timetable scraping feature
*   🐛 Fix campus code extraction bug
*   🎨 Improve UI layout for timetable
*   📝 Update README with contributors

**Common Emojis:**
*   ✨ New feature
*   🐛 Bug fix
*   🎨 UI / style changes
*   📝 Docs / README updates
*   🔧 Config changes
*   ♻️ Refactor code
*   🚑 Hotfix
*   ✅ Tests
*   🔥 Remove code
*   📦 Dependencies

## 📄 License

🪪 Licensed under the **MIT License** — free to use, modify, and share.

## 🙏 Acknowledgements

*   **UiTM Official Timetable** & **UiTM Timetable Mirror** for the data sources.
*   Made with ❤️ by **@sykrwasd**
*   ⭐ If you find this project useful, don’t forget to give it a star! ⭐
