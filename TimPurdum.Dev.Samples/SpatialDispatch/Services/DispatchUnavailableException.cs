namespace TimPurdum.Dev.Samples.SpatialDispatch.Services;

/// <summary>
///     Thrown when the data cannot produce a dispatch answer: no such job, no territory covering it, or
///     nobody available in the territory that does.
/// </summary>
public sealed class DispatchUnavailableException(string message) : InvalidOperationException(message);
