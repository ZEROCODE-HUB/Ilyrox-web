import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-800 rounded-lg border border-gray-200">
          <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
          <h3 className="text-lg font-semibold mb-1">Algo salió mal</h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            Ha ocurrido un error al cargar este componente.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false })}
          >
            Reintentar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
