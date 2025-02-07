import { Component } from "solid-js";

type ErrorBoundaryContentProps = {
    error: any;
}

const ErrorBoundaryContent: Component<ErrorBoundaryContentProps> = (props) => {
    const stackLines = props.error?.stack?.split("\n");
    const errorDetails = stackLines[1] || "Unknown source";
    const lineNumberMatch = errorDetails.match(/:(\d+):(\d+)/);
    const lineNumber = lineNumberMatch ? lineNumberMatch[1] : "Unknown line number";

    return (
        <div class="w-full h-full">
            <p class="dark:text-white">Ooops, an error occured. Please refresh the page</p>
            <p class="dark:text-white">Error Details: {errorDetails}</p>
            <p class="dark:text-white">{props.error.toString()}</p>
            <p class="dark:text-white">Line No: {lineNumber}</p>
        </div>
    );
}

export default ErrorBoundaryContent;