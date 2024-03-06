import time


def timing(func):
    """Measure the time it takes for a function to execute."""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = end_time - start_time
        print(f">>> Execution time for {func.__name__}: {round(execution_time, 5)} seconds")
        wrapper.function_time = execution_time # type: ignore
        return result
    return wrapper
