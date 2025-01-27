import { Component, JSX } from "solid-js";
import HeaderBar from "src/components/HeaderBar";
import ToastAlert from "src/components/ToastAlert";

type NoAuthLayoutProps = {
  children?: JSX.Element | JSX.Element[]; // Type for children
};

const NoAuthLayout: Component<NoAuthLayoutProps> = (props) => {
  return (
    <div class="h-screen flex flex-col overflow-hidden">
      <HeaderBar />

      <div class="mt-20 flex-col h-lvh bg-custom-dark overflow-auto px-4 pt-4">
        <ToastAlert />
        <div class="w-full">{props.children}</div>
      </div>
    </div>
  );
};

export default NoAuthLayout;
