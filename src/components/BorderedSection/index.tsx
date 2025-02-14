const BorderedSection = (props: any) => {
    return (
        <div class="p-2 border border-slate-300 rounded-md mt-5">
            {props.children}
        </div>
    );
}

export default BorderedSection;