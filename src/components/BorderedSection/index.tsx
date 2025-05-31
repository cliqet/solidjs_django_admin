const BorderedSection = (props: any) => {
    return (
        <div class="p-2 bg-teal-100 dark:bg-gray-700 rounded-md mt-5">
            {props.children}
        </div>
    );
}

export default BorderedSection;